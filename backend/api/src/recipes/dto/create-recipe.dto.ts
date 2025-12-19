import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';

import { UpsertIngredientDto } from './upsert-ingredient.dto';

export class CreateRecipeDto {
  @ApiProperty()
  @IsString()
  @Length(3, 160)
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiProperty({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  servings!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  prepMinutes!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cookMinutes!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty!: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  steps!: string[];

  @ApiProperty({ type: [UpsertIngredientDto] })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => UpsertIngredientDto)
  ingredients!: UpsertIngredientDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {}
