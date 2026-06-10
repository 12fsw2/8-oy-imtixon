import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('inventory')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'inventory', version: '1' })
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('movement')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Ombor harakati (kirim/chiqim/tuzatish)' })
  createMovement(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMovementDto,
  ) {
    return this.inventoryService.createMovement(companyId, userId, dto);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Barcha ombor harakatlari' })
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query() query: PaginationDto & { productId?: string },
  ) {
    return this.inventoryService.findAll(companyId, query);
  }

  @Get('product/:productId/history')
  @ApiOperation({ summary: 'Mahsulot ombor tarixi' })
  getHistory(
    @CurrentUser('companyId') companyId: string,
    @Param('productId') productId: string,
  ) {
    return this.inventoryService.getProductHistory(companyId, productId);
  }
}
