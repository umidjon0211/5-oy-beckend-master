import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, IsString, MinLength } from 'class-validator';

export class RegisterSendOtp {
    @ApiProperty({example: '++998911295910'})
    @IsMobilePhone('uz-UZ')
    @IsString()
    phone: string;
}

export class RegisterVerifyDto extends RegisterSendOtp {
    @IsString()
    otp: string;
}

export class RegisterDto extends RegisterVerifyDto {
    @ApiProperty()
    @IsString()
    fullName: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    password: string;
}
