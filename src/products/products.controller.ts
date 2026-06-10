import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('products')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Yangi mahsulot qo\'shish' })
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mahsulotlar ro\'yxati' })
  findAll(@CurrentUser('companyId') companyId: string, @Query() query: ProductQueryDto) {
    return this.productsService.findAll(companyId, query);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Kam qolgan mahsulotlar' })
  getLowStock(@CurrentUser('companyId') companyId: string) {
    return this.productsService.getLowStockProducts(companyId);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Barcode bo\'yicha qidirish' })
  findByBarcode(
    @CurrentUser('companyId') companyId: string,
    @Param('barcode') barcode: string,
  ) {
    return this.productsService.findByBarcode(companyId, barcode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mahsulot ma\'lumotlari' })
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.productsService.findOne(companyId, id);
  }

  @Patch(':id')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Mahsulotni yangilash' })
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    return this.productsService.update(companyId, id, dto);
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Mahsulotni o\'chirish' })
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.productsService.remove(companyId, id);
  }
}
