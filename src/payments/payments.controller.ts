import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('payments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'To\'lov qabul qilish (sotuv yoki qarz uchun)' })
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'To\'lovlar tarixi' })
  findAll(@CurrentUser('companyId') companyId: string, @Query() query: PaginationDto) {
    return this.paymentsService.findAll(companyId, query);
  }
}
