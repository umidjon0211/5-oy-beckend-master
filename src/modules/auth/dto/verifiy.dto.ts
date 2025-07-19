import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyDto {
  @ApiProperty({ example: 'register' })
  @IsString()
  type: string;

  @ApiProperty({ example: '+998911295910' })
  @IsString()
  phone: string;
}
