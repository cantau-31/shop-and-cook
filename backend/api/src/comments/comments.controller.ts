import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FindCommentsQueryDto } from './dto/find-comments-query.dto';

@ApiTags('comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('recipes/:id/comments')
  getRecipeComments(
    @Param('id') id: string,
    @Query() query: FindCommentsQueryDto,
  ) {
    return this.commentsService.listPublic(id, query);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('recipes/:id/comments')
  addComment(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(id, user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Delete('comments/:id')
  deleteComment(@Param('id') id: string, @CurrentUser() user: any) {
    return this.commentsService.delete(id, user);
  }
}
