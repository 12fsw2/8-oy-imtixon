import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(companyId: string) {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      todaySales,
      monthSales,
      totalProducts,
      totalCustomers,
      debtStats,
      lowStockProducts,
    ] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { companyId, deletedAt: null, createdAt: { gte: todayStart, lte: todayEnd } },
        _sum: { totalAmount: true, paidAmount: true, debtAmount: true },
        _count: true,
      }),
      this.prisma.sale.aggregate({
        where: { companyId, deletedAt: null, createdAt: { gte: monthStart, lte: monthEnd } },
        _sum: { totalAmount: true, paidAmount: true, debtAmount: true },
        _count: true,
      }),
      this.prisma.product.count({ where: { companyId, deletedAt: null, isActive: true } }),
      this.prisma.customer.count({ where: { companyId, deletedAt: null } }),
      this.prisma.debt.aggregate({
        where: { companyId, isPaid: false },
        _sum: { remaining: true },
        _count: true,
      }),
      this.prisma.product.findMany({
        where: { companyId, deletedAt: null, isActive: true },
        select: { id: true, name: true, stock: true, minStock: true, unit: true },
      }),
    ]);

    const lowStock = lowStockProducts.filter((p) => p.stock <= p.minStock);

    return {
      today: {
        sales: todaySales._count,
        revenue: Number(todaySales._sum.totalAmount ?? 0),
        paid: Number(todaySales._sum.paidAmount ?? 0),
        debt: Number(todaySales._sum.debtAmount ?? 0),
      },
      month: {
        sales: monthSales._count,
        revenue: Number(monthSales._sum.totalAmount ?? 0),
        paid: Number(monthSales._sum.paidAmount ?? 0),
        debt: Number(monthSales._sum.debtAmount ?? 0),
      },
      totals: {
        products: totalProducts,
        customers: totalCustomers,
        activeDebts: debtStats._count,
        totalRemainingDebt: Number(debtStats._sum.remaining ?? 0),
        lowStockCount: lowStock.length,
      },
    };
  }

  async getTopProducts(companyId: string, limit = 10) {
    const result = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: { companyId, deletedAt: null } },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: limit,
    });

    const productIds = result.map((r) => r.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, salePrice: true, unit: true },
    });

    return result.map((r) => ({
      product: products.find((p) => p.id === r.productId),
      totalQuantity: r._sum.quantity,
      totalRevenue: Number(r._sum.totalPrice ?? 0),
    }));
  }

  async getMonthlySales(companyId: string, year?: number) {
    const targetYear = year ?? new Date().getFullYear();
    const start = new Date(targetYear, 0, 1);
    const end = new Date(targetYear, 11, 31, 23, 59, 59);

    const sales = await this.prisma.sale.findMany({
      where: { companyId, deletedAt: null, createdAt: { gte: start, lte: end } },
      select: { totalAmount: true, paidAmount: true, createdAt: true },
    });

    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      sales: 0,
      revenue: 0,
      paid: 0,
    }));

    for (const sale of sales) {
      const month = sale.createdAt.getMonth();
      monthly[month].sales++;
      monthly[month].revenue += Number(sale.totalAmount);
      monthly[month].paid += Number(sale.paidAmount);
    }

    return monthly;
  }

  async getDebtors(companyId: string, limit = 10) {
    return this.prisma.customer.findMany({
      where: { companyId, deletedAt: null, totalDebt: { gt: 0 } },
      select: { id: true, fullName: true, phone: true, totalDebt: true },
      orderBy: { totalDebt: 'desc' },
      take: limit,
    });
  }

  async getProfit(companyId: string) {
    const saleItems = await this.prisma.saleItem.findMany({
      where: { sale: { companyId, deletedAt: null } },
      include: { product: { select: { purchasePrice: true } } },
    });

    let totalRevenue = 0;
    let totalCost = 0;

    for (const item of saleItems) {
      totalRevenue += item.quantity * Number(item.price);
      totalCost += item.quantity * Number(item.product.purchasePrice);
    }

    return {
      totalRevenue,
      totalCost,
      grossProfit: totalRevenue - totalCost,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
    };
  }
}
