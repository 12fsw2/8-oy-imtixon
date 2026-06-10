import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { buildPagination, buildPaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateProductDto) {
    if (dto.sku) {
      const exists = await this.prisma.product.findFirst({
        where: { companyId, sku: dto.sku, deletedAt: null },
      });
      if (exists) throw new ConflictException('SKU already exists in this company');
    }

    return this.prisma.product.create({
      data: { ...dto, companyId },
      include: { category: { select: { id: true, name: true } } },
    });
  }

  async findAll(companyId: string, query: ProductQueryDto) {
    const { page = 1, limit = 20, search, categoryId, lowStock } = query;
    const where: Prisma.ProductWhereInput = {
      companyId,
      deletedAt: null,
      ...(categoryId && { categoryId }),
      ...(lowStock && { stock: { lte: this.prisma.product.fields.minStock as any } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search } },
        ],
      }),
    };

    // Handle lowStock filter separately (need to compare two columns)
    const whereWithLowStock = lowStock
      ? { ...where, stock: undefined }
      : where;

    const [total, allItems] = await Promise.all([
      this.prisma.product.count({ where: lowStock ? { ...where, stock: undefined } : where }),
      this.prisma.product.findMany({
        where: lowStock ? { ...where, stock: undefined } : where,
        include: { category: { select: { id: true, name: true } } },
        ...buildPagination(page, limit),
        orderBy: { name: 'asc' },
      }),
    ]);

    const items = lowStock
      ? allItems.filter((p) => p.stock <= p.minStock)
      : allItems;

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByBarcode(companyId: string, barcode: string) {
    const product = await this.prisma.product.findFirst({
      where: { companyId, barcode, deletedAt: null, isActive: true },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(companyId: string, id: string, dto: Partial<CreateProductDto>) {
    await this.findOne(companyId, id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: { select: { id: true, name: true } } },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true },
    });
  }

  async getLowStockProducts(companyId: string) {
    const products = await this.prisma.product.findMany({
      where: { companyId, deletedAt: null, isActive: true },
      select: { id: true, name: true, stock: true, minStock: true, unit: true },
    });
    return products.filter((p) => p.stock <= p.minStock);
  }
}
