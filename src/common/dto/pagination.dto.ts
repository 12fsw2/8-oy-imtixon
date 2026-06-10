import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export function buildPagination(page: number | string = 1, limit: number | string = 20) {
  const p = Number(page) || 1;
  const l = Number(limit) || 20;
  return { skip: (p - 1) * l, take: l };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
) {
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}
