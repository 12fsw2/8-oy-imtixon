import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaginationDto, buildPagination, buildPaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreatePaymentDto) {
    if (!dto.saleId && !dto.debtId) {
      throw new BadRequestException('Either saleId or debtId must be provided');
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          companyId,
          saleId: dto.saleId,
          debtId: dto.debtId,
          amount: dto.amount,
          method: dto.method ?? 'CASH',
          note: dto.note,
        },
      });

      // Update debt if debtId provided
      if (dto.debtId) {
        const debt = await tx.debt.findFirst({
          where: { id: dto.debtId, companyId },
        });
        if (!debt) throw new NotFoundException('Debt not found');
        if (debt.isPaid) throw new BadRequestException('Debt already paid');

        const newPaid = Number(debt.paidAmount) + dto.amount;
        const newRemaining = Math.max(0, Number(debt.totalAmount) - newPaid);
        const isPaid = newRemaining === 0;

        await tx.debt.update({
          where: { id: dto.debtId },
          data: { paidAmount: newPaid, remaining: newRemaining, isPaid },
        });

        // Update customer totalDebt
        if (debt.customerId) {
          await tx.customer.update({
            where: { id: debt.customerId },
            data: { totalDebt: { decrement: dto.amount } },
          });
        }

        // Update related sale if exists
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
      }

      return payment;
    });
  }

  async findAll(companyId: string, query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const where = { companyId };

    const [total, items] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        include: {
          sale: { select: { id: true } },
          debt: { select: { id: true, customer: { select: { fullName: true } } } },
        },
        ...buildPagination(page, limit),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }
}
