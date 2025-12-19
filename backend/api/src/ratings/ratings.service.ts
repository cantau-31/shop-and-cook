import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Rating } from './entities/rating.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly repo: Repository<Rating>,
  ) {}

  async rate(recipeId: string, user: User, dto: CreateRatingDto) {
    let rating = await this.repo.findOne({
      where: { recipeId, userId: user.id },
    });
    if (rating) {
      rating.stars = dto.stars;
    } else {
      rating = this.repo.create({
        recipeId,
        userId: user.id,
        stars: dto.stars,
      });
    }
    await this.repo.save(rating);

    const result = await this.repo
      .createQueryBuilder('rating')
      .select('AVG(rating.stars)', 'avg')
      .where('rating.recipeId = :recipeId', { recipeId })
      .getRawOne<{ avg: string }>();

    const avg = result?.avg || '0';

    return {
      stars: rating.stars,
      average: avg ? Number(avg) : rating.stars,
    };
  }
}
