import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Savdo Do\'koni' })
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @ApiPropertyOptional({ example: 'Toshkent, Chilonzor 5' })
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @ApiProperty({ example: '+998901234567' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Ali' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Valiyev' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
