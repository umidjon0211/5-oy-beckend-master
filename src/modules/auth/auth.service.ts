import {
    Injectable,
    UnauthorizedException,
    HttpException,
    HttpStatus,
    Inject,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { VerificationService } from '../verification/verification.service';
import { LoginDto } from './dto/dto.login';
import { RegisterDto } from './dto/dto.register';
import { RefreshTokenDto } from './dto/token.ref';
import { ResetPasswordDto } from './dto/ResetPasswordDto';
import { EVerificationTypes } from 'src/common/types/verification';
import { hashPassword } from 'src/utils/bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) { }

    private async generateTokens(userId: number, phone: string) {
        const payload = { sub: userId, phone };
        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: '15m',
            secret: process.env.JWT_ACCESS_SECRET,
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '7d',
            secret: process.env.JWT_REFRESH_SECRET,
        });
        return { accessToken, refreshToken };
    }

    async sendOtp(type: string, phone: string) {
        if (type !== 'register') {
            throw new UnauthorizedException('Invalid type');
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await this.cacheManager.set(`otp:${phone}`, otp, 300);


        return { message: 'OTP sent successfully', otp };
    }

    async verifyOtp(phone: string, otp: string) {
        const savedOtp = await this.cacheManager.get<string>(`otp:${phone}`);
        if (!savedOtp || savedOtp !== otp) {
            throw new UnauthorizedException('Invalid OTP');
        }
        await this.cacheManager.del(`otp:${phone}`);
        return { message: 'OTP verified successfully' };
    }

    async register(payload: RegisterDto) {
        await this.verifyOtp(payload.phone, payload.otp);

        const userExists = await this.prisma.users.findUnique({
            where: { phone: payload.phone },
        });
        if (userExists) {
            throw new UnauthorizedException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(payload.password, 10);
        const user = await this.prisma.users.create({
            data: {
                phone: payload.phone,
                fullName: payload.fullName,
                password: hashedPassword,
            },
        });

        const tokens = await this.generateTokens(user.id, user.phone);

        return {
            message: 'User registered successfully',
            user: { id: user.id, phone: user.phone, fullName: user.fullName },
            ...tokens,
        };
    }

    async login(payload: LoginDto) {
        const user = await this.prisma.users.findUnique({
            where: { phone: payload.phone },
        });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(payload.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.generateTokens(user.id, user.phone);
        return {
            message: 'Login successful',
            ...tokens,
        };
    }

    async refreshToken(payload: RefreshTokenDto) {
        try {
            const decoded = await this.jwtService.verifyAsync(payload.refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            const user = await this.prisma.users.findUnique({
                where: { id: decoded.sub },
            });
            if (!user) {
                throw new UnauthorizedException('User not found');
            }
            return this.generateTokens(user.id, user.phone);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async resetPassword(payload: ResetPasswordDto) {
        await VerificationService.checkConfirmOtp({
            type: EVerificationTypes.RESET_PASSWORD,
            phone: payload.phone,
            otp: payload.otp,
        });

        const hashedPassword = await hashPassword(payload.password);

        await this.prisma.users.update({
            where: { phone: payload.phone },
            data: { password: hashedPassword },
        });

        return {
            success: true,
            message: 'Password has been reset successfully',
        };
    }
}
