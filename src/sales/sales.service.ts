import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SaleStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PaginationDto, buildPagination, buildPaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateSaleDto) {
    const productIds = dto.items.map((i) => i.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, companyId, deletedAt: null, isActive: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found or inactive');
    }

    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,
        );
      }
    }

    const saleItems = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const price = item.price ?? Number(product.salePrice);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
        totalPrice: price * item.quantity,
      };
    });

    const totalAmount = saleItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const paidAmount = dto.paidAmount !== undefined ? dto.paidAmount : totalAmount;
    const debtAmount = Math.max(0, totalAmount - paidAmount);

    let status: SaleStatus = 'PAID';
    if (debtAmount > 0 && paidAmount > 0) status = 'PARTIAL';
    else if (paidAmount === 0) status = 'UNPAID';

    if (debtAmount > 0 && !dto.customerId) {
      throw new BadRequestException('Customer is required for credit sales (debtAmount > 0)');
    }

    const sale = await this.prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          companyId,
          customerId: dto.customerId,
          userId,
          status,
          totalAmount,
          paidAmount,
          debtAmount,
          note: dto.note,
          items: { create: saleItems },
        },
        include: {
          items: {
            include: { product: { select: { id: true, name: true, unit: true } } },
          },
          customer: { select: { id: true, fullName: true, phone: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      // Stock decrease + inventory log
      for (const item of dto.items) {
        const product = products.find((p) => p.id === item.productId)!;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            companyId,
            productId: item.productId,
            userId,
            type: 'OUT',
            quantity: item.quantity,
            beforeStock: product.stock,
            afterStock: product.stock - item.quantity,
            note: `Sale: ${created.id}`,
          },
        });
      }

      // Payment record
      if (paidAmount > 0) {
        await tx.payment.create({
          data: {
            companyId,
            saleId: created.id,
            amount: paidAmount,
            method: dto.paymentMethod ?? 'CASH',
          },
        });
      }

      // Create debt if any
      if (debtAmount > 0 && dto.customerId) {
        await tx.debt.create({
          data: {
            companyId,
            customerId: dto.customerId,
            saleId: created.id,
            totalAmount: debtAmount,
            remaining: debtAmount,
          },
        });
        await tx.customer.update({
          where: { id: dto.customerId },
          data: { totalDebt: { increment: debtAmount } },
        });
      }

      return created;
    });

    return sale;
  }

  async findAll(companyId: string, query: PaginationDto) {
    const { page = 1, limit = 20, search } = query;
    const where = {
      companyId,
      deletedAt: null,
      ...(search && {
        customer: { fullName: { contains: search, mode: 'insensitive' as const } },
      }),
    };

    const [total, items] = await Promise.all([
      this.prisma.sale.count({ where }),
      this.prisma.sale.findMany({
        where,
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { items: true } },
        },
        ...buildPagination(page, limit),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        customer: true,
        user: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, salePrice: true, unit: true } },
          },
        },
        payments: true,
        debt: true,
      },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async getDailyStats(companyId: string, date?: Date) {
    const target = date ?? new Date();
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: { companyId, deletedAt: null, createdAt: { gte: start, lte: end } },
      select: { totalAmount: true, paidAmount: true, debtAmount: true, status: true },
    });

    return {
      totalSales: sales.length,
      totalRevenue: sales.reduce((s, i) => s + Number(i.totalAmount), 0),
      totalPaid: sales.reduce((s, i) => s + Number(i.paidAmount), 0),
      totalDebt: sales.reduce((s, i) => s + Number(i.debtAmount), 0),
    };
  }
}
