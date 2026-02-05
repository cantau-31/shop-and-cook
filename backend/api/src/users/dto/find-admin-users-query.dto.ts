import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class FindAdminUsersQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => Number(value) || 1)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => Number(value) || 20)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
