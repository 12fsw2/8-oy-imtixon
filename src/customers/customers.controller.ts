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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('customers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'customers', version: '1' })
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi mijoz qo\'shish' })
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mijozlar ro\'yxati' })
  findAll(@CurrentUser('companyId') companyId: string, @Query() query: PaginationDto) {
    return this.customersService.findAll(companyId, query);
  }

  @Get('debtors')
  @ApiOperation({ summary: 'Qarzdor mijozlar ro\'yxati' })
  getDebtors(@CurrentUser('companyId') companyId: string) {
    return this.customersService.getDebtors(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mijoz ma\'lumotlari (sotuvlar va qarzlar bilan)' })
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.customersService.findOne(companyId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mijozni yangilash' })
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateCustomerDto>,
  ) {
    return this.customersService.update(companyId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Mijozni o\'chirish' })
  remove(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.customersService.remove(companyId, id);
  }
}
