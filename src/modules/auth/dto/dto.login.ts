import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '+998911295910',
    description: 'User phone number in international format',
  })
  @IsMobilePhone('uz-UZ')
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'strongpassword123',
    description: 'User password (minimum 8 characters)',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
