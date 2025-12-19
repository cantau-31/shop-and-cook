import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FindRecipesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    // Si c'est déjà un nombre, le retourner
    if (!isNaN(Number(value))) return Number(value);
    // Sinon, laisser comme chaîne pour recherche par nom
    return value;
  })
  category?: number | string;

  @ApiPropertyOptional({
    enum: ['easy', 'medium', 'hard', '1', '2', '3', '4', '5'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    // Mapping des chaînes vers les nombres
    const difficultyMap: { [key: string]: number } = {
      easy: 1,
      medium: 3,
      hard: 5,
    };
    // Si c'est déjà un nombre, le retourner
    if (!isNaN(Number(value))) return Number(value);
    // Sinon, utiliser le mapping
    return difficultyMap[value.toLowerCase()] || undefined;
  })
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(0)
  maxTime?: number;

  @ApiPropertyOptional({
    description: 'Filter by author id'
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? String(value) : undefined))
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => Number(value) || 1)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 12 })
  @Transform(({ value }) => Number(value) || 12)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 12;
}
