import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Rating } from './entities/rating.entity';
import { RatingsService } from './ratings.service';

const createQueryBuilderMock = () => {
  const qb: any = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ avg: '4.0' })
  };
  return qb;
};

describe('RatingsService', () => {
  let service: RatingsService;
  const repoMock = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn((data) => data),
    createQueryBuilder: jest.fn(createQueryBuilderMock)
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: getRepositoryToken(Rating),
          useValue: repoMock
        }
      ]
    }).compile();

    service = module.get(RatingsService);
  });

  it('creates a new rating when none exists', async () => {
    repoMock.findOne.mockResolvedValue(null);
    repoMock.save.mockImplementation(async (rating) => rating);

    const result = await service.rate('1', { id: '2' } as any, { stars: 5 });

    expect(repoMock.save).toHaveBeenCalled();
    expect(result.average).toEqual(4);
  });

  it('updates existing rating for same user/recipe', async () => {
    repoMock.findOne.mockResolvedValue({ id: '1', stars: 3 });
    repoMock.save.mockImplementation(async (rating) => rating);

    const result = await service.rate('1', { id: '2' } as any, { stars: 4 });

    expect(repoMock.save).toHaveBeenCalledWith({ id: '1', stars: 4 });
    expect(result.stars).toEqual(4);
  });
});
