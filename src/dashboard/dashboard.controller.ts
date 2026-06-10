import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Asosiy ko\'rsatkichlar (bugun, oy, jami)' })
  getOverview(@CurrentUser('companyId') companyId: string) {
    return this.dashboardService.getOverview(companyId);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Eng ko\'p sotiladigan mahsulotlar' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopProducts(
    @CurrentUser('companyId') companyId: string,
    @Query('limit') limit?: number,
  ) {
    return this.dashboardService.getTopProducts(companyId, limit);
  }

  @Get('monthly-sales')
  @ApiOperation({ summary: 'Oylik sotuv statistikasi' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getMonthlySales(
    @CurrentUser('companyId') companyId: string,
    @Query('year') year?: number,
  ) {
    return this.dashboardService.getMonthlySales(companyId, year);
  }

  @Get('debtors')
  @ApiOperation({ summary: 'Eng ko\'p qarzdor mijozlar' })
  getDebtors(@CurrentUser('companyId') companyId: string) {
    return this.dashboardService.getDebtors(companyId);
  }

  @Get('profit')
  @ApiOperation({ summary: 'Foyda hisoboti' })
  getProfit(@CurrentUser('companyId') companyId: string) {
    return this.dashboardService.getProfit(companyId);
  }
}
