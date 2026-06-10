import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { MovementType } from '@prisma/client';

export class CreateMovementDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ enum: MovementType })
  @IsNotEmpty()
  @IsEnum(MovementType)
  type: MovementType;

  @ApiProperty({ minimum: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
