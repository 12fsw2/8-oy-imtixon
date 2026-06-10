import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  create(companyId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: { ...dto, companyId } });
  }

  findAll(companyId: string) {
    return this.prisma.category.findMany({
      where: { companyId, deletedAt: null },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const cat = await this.prisma.category.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async update(companyId: string, id: string, dto: CreateCategoryDto) {
    await this.findOne(companyId, id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
