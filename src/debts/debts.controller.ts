import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DebtsService } from './debts.service';
import { PayDebtDto } from './dto/pay-debt.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('debts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'debts', version: '1' })
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha qarzlar' })
  @ApiQuery({ name: 'isPaid', required: false, type: Boolean })
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query() query: PaginationDto & { isPaid?: boolean },
  ) {
    return this.debtsService.findAll(companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Qarz statistikasi' })
  getStats(@CurrentUser('companyId') companyId: string) {
    return this.debtsService.getStats(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Qarz tafsilotlari va to\'lov tarixi' })
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.debtsService.findOne(companyId, id);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Qarzni to\'lash (qisman yoki to\'liq)' })
  pay(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: PayDebtDto,
  ) {
    return this.debtsService.pay(companyId, id, dto);
  }
}
