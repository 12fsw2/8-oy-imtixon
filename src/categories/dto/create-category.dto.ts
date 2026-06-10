import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Ichimliklar' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
