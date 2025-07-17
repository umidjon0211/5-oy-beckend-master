import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMobilePhone, IsString } from 'class-validator';
import { EVerificationTypes } from 'src/common/types/verification';

export class SendOtpDto {
  @ApiProperty({
    enum: EVerificationTypes,
  })
  @IsEnum(EVerificationTypes)
  type: EVerificationTypes;

  @ApiProperty({
    example: '+998911295910',
  })
  @IsMobilePhone('uz-UZ')
  @IsString()
  phone: string;
}

export class VerifyOtpDto extends SendOtpDto {
  @ApiProperty({
    example: '12345',
  })
  @IsString()
  otp: string;
}
