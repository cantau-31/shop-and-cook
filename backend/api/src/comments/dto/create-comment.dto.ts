import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @Length(3, 500)
  body!: string;
}
