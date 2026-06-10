import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, buildPagination, buildPaginatedResponse } from '../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (exists) throw new ConflictException('Phone already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { ...dto, password: hashed, companyId },
      select: { id: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, createdAt: true },
    });
  }

  async findAll(companyId: string, query: PaginationDto) {
    const { page = 1, limit = 20, search } = query;
    const where = {
      companyId,
      deletedAt: null,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      }),
    };

    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: { id: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, createdAt: true },
        ...buildPagination(page, limit),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(companyId: string, id: string, dto: UpdateUserDto, requesterId: string, requesterRole: string) {
    const user = await this.findOne(companyId, id);

    // Only OWNER can change roles; users can't change their own role
    if (dto.role && requesterRole !== 'OWNER')
      throw new ForbiddenException('Only OWNER can change roles');

    // Prevent deactivating yourself
    if (dto.isActive === false && id === requesterId)
      throw new ForbiddenException('Cannot deactivate yourself');

    const data: any = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, firstName: true, lastName: true, phone: true, role: true, isActive: true },
    });
  }

  async remove(companyId: string, id: string, requesterId: string) {
    if (id === requesterId) throw new ForbiddenException('Cannot delete yourself');
    await this.findOne(companyId, id);
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true },
    });
  }
}
