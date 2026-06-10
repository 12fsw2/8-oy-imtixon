import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { PaginationDto, buildPagination, buildPaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async createMovement(companyId: string, userId: string, dto: CreateMovementDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, companyId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    if (dto.type === 'OUT' && product.stock < dto.quantity) {
      throw new BadRequestException(
        `Cannot remove ${dto.quantity} units. Current stock: ${product.stock}`,
      );
    }

    const delta = dto.type === 'IN' ? dto.quantity : -dto.quantity;
    const afterStock = product.stock + delta;

    return this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: dto.productId },
        data: { stock: afterStock },
      });

      return tx.inventoryMovement.create({
        data: {
          companyId,
          productId: dto.productId,
          userId,
          type: dto.type,
          quantity: dto.quantity,
          beforeStock: product.stock,
          afterStock,
          note: dto.note,
        },
        include: {
          product: { select: { id: true, name: true, stock: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    });
  }

  async findAll(companyId: string, query: PaginationDto & { productId?: string }) {
    const { page = 1, limit = 20, productId } = query;
    const where = {
      companyId,
      ...(productId && { productId }),
    };

    const [total, items] = await Promise.all([
      this.prisma.inventoryMovement.count({ where }),
      this.prisma.inventoryMovement.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, unit: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        ...buildPagination(page, limit),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async getProductHistory(companyId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, companyId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.inventoryMovement.findMany({
      where: { companyId, productId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
