import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, IsString, MinLength } from 'class-validator';


export class RegisterSendOtp {
  @ApiProperty({
    example: '+998911295910',
    description: 'User phone number in international format',
  })
  @IsMobilePhone('uz-UZ')
  @IsString()
  phone: string;
}

export class RegisterDto {
  @ApiProperty({ example: '+998911234567' })
  @IsMobilePhone('uz-UZ')
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  otp: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName: string;
}
