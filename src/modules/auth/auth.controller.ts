import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/dto.login';
import { RegisterDto } from './dto/dto.register';
import { VerifyDto } from './dto/verifiy.dto';
import { RefreshTokenDto } from './dto/token.ref';
import { ResetPasswordDto } from './dto/ResetPasswordDto';
@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @ApiOperation({ summary: 'Send OTP to phone' })
    @ApiResponse({ status: 201, description: 'OTP sent successfully' })
    @Post('verify')
    verify(@Body() payload: VerifyDto) {
        return this.authService.sendOtp(payload);
    }


    @ApiOperation({
        summary: 'User registration with OTP verification',
        description: 'Register user after verifying OTP sent to phone',
    })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @Post('register')
    register(@Body() payload: RegisterDto) {
        return this.authService.register(payload);
    }

    @ApiOperation({ summary: 'User login with phone and password' })
    @ApiResponse({ status: 201, description: 'User successfully logged in' })
    @Post('login')
    login(@Body() payload: LoginDto) {
        return this.authService.login(payload);
    }

    @ApiOperation({ summary: 'Refresh JWT access token' })
    @ApiResponse({ status: 201, description: 'Access token refreshed' })
    @Post('refresh-token')
    refreshToken(@Body() payload: RefreshTokenDto) {
        return this.authService.refreshToken(payload);
    }

    @ApiOperation({
        summary: 'Reset password after OTP verification',
        description: 'Reset user password using phone, OTP and new password',
    })
    @ApiResponse({ status: 201, description: 'Password reset successfully' })
    @Post('reset-password')
    resetPassword(@Body() payload: ResetPasswordDto) {
        return this.authService.resetPassword(payload);
    }
}
