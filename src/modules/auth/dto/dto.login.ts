import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMobilePhone, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({example: 'umidjonnew@gmail.com'})
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
