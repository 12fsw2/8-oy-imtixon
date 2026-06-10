import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class PayDebtDto {
  @ApiProperty({ example: 25000 })
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
