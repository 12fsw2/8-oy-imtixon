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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Yangi xodim qo\'shish' })
  create(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha xodimlar ro\'yxati' })
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query() query: PaginationDto,
  ) {
    return this.usersService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xodim ma\'lumotlari' })
  findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.usersService.findOne(companyId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Xodimni yangilash' })
  update(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') requesterId: string,
    @CurrentUser('role') requesterRole: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(companyId, id, dto, requesterId, requesterRole);
  }

  @Delete(':id')
  @Roles('OWNER')
  @ApiOperation({ summary: 'Xodimni o\'chirish (OWNER)' })
  remove(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') requesterId: string,
    @Param('id') id: string,
  ) {
    return this.usersService.remove(companyId, id, requesterId);
  }
}
