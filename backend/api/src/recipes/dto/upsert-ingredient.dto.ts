import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertIngredientDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ingredientId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  quantity!: number;

  @ApiProperty()
  @IsString()
  unit!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpsertIngredientsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertIngredientDto)
  items!: UpsertIngredientDto[];
}
