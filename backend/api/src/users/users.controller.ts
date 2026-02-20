import { Controller, Delete, Get, Param, Patch, Query, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from './users.service';
import { FindAdminUsersQueryDto } from './dto/find-admin-users-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: any) {
    const entity = await this.usersService.findById(user.id);
    return {
      id: entity?.id,
      email: entity?.email,
      displayName: entity?.displayName,
      role: entity?.role,
      createdAt: entity?.createdAt
    };
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('me/export')
  exportMe(@CurrentUser() user: any) {
    return this.usersService.exportOwnData(user.id);
  }

  @Delete('me')
  deleteMe(@CurrentUser() user: any) {
    return this.usersService.deleteOwnAccount(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/users')
  listAdmin(@Query() query: FindAdminUsersQueryDto) {
    return this.usersService.listAdmin(query);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/users/:id')
  updateAdmin(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateAdmin(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/users/:id')
  deleteAdmin(@Param('id') id: string) {
    return this.usersService.deleteAdmin(id);
  }
}
