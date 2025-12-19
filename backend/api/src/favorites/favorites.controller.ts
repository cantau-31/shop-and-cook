import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('recipes/:id/favorite')
  add(@Param('id') id: string, @CurrentUser() user: any) {
    return this.favoritesService.toggle(user.id, id, true);
  }

  @Delete('recipes/:id/favorite')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.favoritesService.toggle(user.id, id, false);
  }

  @Get('me/favorites')
  list(@CurrentUser() user: any) {
    return this.favoritesService.listForUser(user.id);
  }
}
