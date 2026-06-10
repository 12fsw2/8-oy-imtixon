import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PayDebtDto } from './dto/pay-debt.dto';
import { PaginationDto, buildPagination, buildPaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class DebtsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: PaginationDto & { isPaid?: any }) {
    const { page = 1, limit = 20, isPaid } = query;
    const isPaidBool =
      isPaid === undefined ? undefined : isPaid === true || isPaid === 'true';
    const where = {
      companyId,
      ...(isPaidBool !== undefined && { isPaid: isPaidBool }),
    };

    const [total, items] = await Promise.all([
      this.prisma.debt.count({ where }),
      this.prisma.debt.findMany({
        where,
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          sale: { select: { id: true, createdAt: true } },
          payments: {
            select: { id: true, amount: true, method: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          },
        },
        ...buildPagination(page, limit),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const debt = await this.prisma.debt.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        sale: {
          include: {
            items: { include: { product: { select: { id: true, name: true } } } },
          },
        },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!debt) throw new NotFoundException('Debt not found');
    return debt;
  }

  async pay(companyId: string, id: string, dto: PayDebtDto) {
    const debt = await this.prisma.debt.findFirst({ where: { id, companyId } });
    if (!debt) throw new NotFoundException('Debt not found');
    if (debt.isPaid) throw new BadRequestException('Debt is already fully paid');
    if (dto.amount > Number(debt.remaining)) {
      throw new BadRequestException(
        `Payment amount (${dto.amount}) exceeds remaining debt (${debt.remaining})`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const newPaid = Number(debt.paidAmount) + dto.amount;
      const newRemaining = Number(debt.remaining) - dto.amount;
      const isPaid = newRemaining === 0;

      const updated = await tx.debt.update({
        where: { id },
        data: { paidAmount: newPaid, remaining: newRemaining, isPaid },
      });

      await tx.payment.create({
        data: {
          companyId,
          debtId: id,
          amount: dto.amount,
          method: dto.method ?? 'CASH',
          note: dto.note,
        },
      });

      await tx.customer.update({
        where: { id: debt.customerId },
        data: { totalDebt: { decrement: dto.amount } },
      });

      // Update related sale status
      if (debt.saleId) {
        const sale = await tx.sale.findUnique({ where: { id: debt.saleId } });
        if (sale) {
          const newSalePaid = Number(sale.paidAmount) + dto.amount;
          const newSaleDebt = Math.max(0, Number(sale.debtAmount) - dto.amount);
          const status = newSaleDebt === 0 ? 'PAID' : 'PARTIAL';
          await tx.sale.update({
            where: { id: debt.saleId },
            data: { paidAmount: newSalePaid, debtAmount: newSaleDebt, status },
          });
        }
      }

      return updated;
    });
  }

  async getStats(companyId: string) {
    const [total, paid, unpaid] = await Promise.all([
      this.prisma.debt.aggregate({
        where: { companyId },
        _sum: { totalAmount: true, paidAmount: true, remaining: true },
        _count: true,
      }),
      this.prisma.debt.count({ where: { companyId, isPaid: true } }),
      this.prisma.debt.count({ where: { companyId, isPaid: false } }),
    ]);

    return {
      totalDebts: total._count,
      paidDebts: paid,
      unpaidDebts: unpaid,
      totalAmount: Number(total._sum.totalAmount ?? 0),
      totalPaid: Number(total._sum.paidAmount ?? 0),
      totalRemaining: Number(total._sum.remaining ?? 0),
    };
  }
}
