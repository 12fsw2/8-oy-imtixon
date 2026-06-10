import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Jasur Mirzayev' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Toshkent, Yunusobod' })
  @IsOptional()
  @IsString()
  address?: string;
}
