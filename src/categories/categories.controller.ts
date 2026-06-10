import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('categories')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Kategoriya yaratish' })
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha kategoriyalar' })
  findAll(@CurrentUser('companyId') companyId: string) {
    return this.categoriesService.findAll(companyId);
  }

  @Patch(':id')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Kategoriyani yangilash' })
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.update(companyId, id, dto);
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Kategoriyani o\'chirish' })
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.categoriesService.remove(companyId, id);
  }
}
