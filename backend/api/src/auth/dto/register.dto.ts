import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  displayName!: string;

  @ApiProperty()
  @Equals(true, {
    message: 'Privacy policy must be accepted',
  })
  privacyAccepted!: boolean;

  @ApiProperty({ default: 'v1.0' })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  privacyPolicyVersion!: string;
}
