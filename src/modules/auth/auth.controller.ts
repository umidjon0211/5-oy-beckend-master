// import { Body, Controller, Post } from '@nestjs/common';
// import { AuthServic } from './auth.service'; 
// import { ApiOperation, ApiTags } from '@nestjs/swagger';
// import { LoginDto } from './dto/dto.login';
// import { RegisterDto } from './dto/dto.register';
// import { RefreshTokenDto } from './dto/token.ref';

// @ApiTags('Authentication')
// @Controller('api/auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @Post('login')
//   login(@Body() payload: LoginDto) {
//     return this.authService.login(payload);
//   }

//   @ApiOperation({
//     description:
//       'Create user and get tokens. You should send register type verification & verify that before register.',
//     summary: 'OTP verification',
//   })
//   @Post('register')
//   register(@Body() payload: RegisterDto) {
//     return this.authService.register(payload);
//   }

//   @Post('refresh-token')
//   refreshToken(@Body() payload: RefreshTokenDto) {
//     return this.authService.refreshToken(payload);
//   }

// }
