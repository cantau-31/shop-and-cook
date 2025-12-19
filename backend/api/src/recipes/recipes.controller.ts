import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateRecipeDto, UpdateRecipeDto } from './dto/create-recipe.dto';
import { FindRecipesQueryDto } from './dto/find-recipes-query.dto';
import { UpsertIngredientDto } from './dto/upsert-ingredient.dto';
import { RecipesService } from './recipes.service';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  findAll(@Query() query: FindRecipesQueryDto) {
    return this.recipesService.findAllPublic(query);
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.recipesService.findPublicByIdOrSlug(idOrSlug);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateRecipeDto) {
    return this.recipesService.create(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Put(':id')
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateRecipeDto) {
    return this.recipesService.update(id, user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Put(':id/ingredients')
  updateIngredients(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() items: UpsertIngredientDto[]
  ) {
    return this.recipesService.replaceIngredients(id, user, items);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.recipesService.remove(id, user);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/:id/hide')
  hide(@Param('id') id: string) {
    return this.recipesService.hide(id);
  }
}
