import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class VerifyPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;
}
