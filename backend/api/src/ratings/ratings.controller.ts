import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingsService } from './ratings.service';

@ApiTags('ratings')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('recipes/:id/rating')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  rate(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: CreateRatingDto) {
    return this.ratingsService.rate(id, user, dto);
  }
}
