import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class FindCommentsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => Number(value) || 1)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 10 })
  @Transform(({ value }) => Number(value) || 10)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;
}
