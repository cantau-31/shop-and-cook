import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { UsersService } from './users.service';

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
}
