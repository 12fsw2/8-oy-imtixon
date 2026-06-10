import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('company')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'company', version: '1' })
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOperation({ summary: 'Kompaniya ma\'lumotlari' })
  findOne(@CurrentUser('companyId') companyId: string) {
    return this.companyService.findOne(companyId);
  }

  @Patch()
  @Roles('OWNER')
  @ApiOperation({ summary: 'Kompaniyani yangilash (faqat OWNER)' })
  update(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companyService.update(companyId, dto);
  }
}
