import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: '+998901234567', description: 'User phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123456', description: 'OTP code sent to phone' })
  @IsString()
  otp: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'New password (min 8 characters)',
  })
  @IsString()
  @Length(8, 32, { message: 'Password must be between 8 and 32 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: 'Password must contain letters and numbers',
  })
  password: string;
}
