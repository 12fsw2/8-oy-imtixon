import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('sales')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'sales', version: '1' })
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi sotuv yaratish (stock avtomatik kamayadi)' })
  create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSaleDto,
  ) {
    return this.salesService.create(companyId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Sotuvlar ro\'yxati' })
  findAll(@CurrentUser('companyId') companyId: string, @Query() query: PaginationDto) {
    return this.salesService.findAll(companyId, query);
  }

  @Get('daily-stats')
  @ApiOperation({ summary: 'Kunlik statistika' })
  dailyStats(@CurrentUser('companyId') companyId: string) {
    return this.salesService.getDailyStats(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Sotuv tafsilotlari' })
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.salesService.findOne(companyId, id);
  }
}
