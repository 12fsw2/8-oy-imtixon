import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiPropertyOptional({ description: 'Sale ID (sotuv to\'lovi)' })
  @IsOptional()
  @IsString()
  saleId?: string;

  @ApiPropertyOptional({ description: 'Debt ID (qarz to\'lovi)' })
  @IsOptional()
  @IsString()
  debtId?: string;

  @ApiProperty({ example: 50000 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
