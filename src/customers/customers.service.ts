import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PaginationDto, buildPagination, buildPaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({ data: { ...dto, companyId } });
  }

  async findAll(companyId: string, query: PaginationDto) {
    const { page = 1, limit = 20, search } = query;
    const where = {
      companyId,
      deletedAt: null,
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
          { address: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [total, items] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { fullName: 'asc' },
      }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        sales: {
          where: { deletedAt: null },
          select: { id: true, totalAmount: true, paidAmount: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        debts: {
          where: { isPaid: false },
          select: { id: true, totalAmount: true, remaining: true, dueDate: true, createdAt: true },
        },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async getDebtors(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId, deletedAt: null, totalDebt: { gt: 0 } },
      select: { id: true, fullName: true, phone: true, totalDebt: true },
      orderBy: { totalDebt: 'desc' },
    });
  }

  async update(companyId: string, id: string, dto: Partial<CreateCustomerDto>) {
    await this.findOne(companyId, id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true },
    });
  }
}
