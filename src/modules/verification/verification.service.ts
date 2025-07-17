import { EVerificationTypes, ICheckOtp } from "src/common/types/verification";
import { SendOtpDto, VerifyOtpDto } from "./dto/verification.dto"; // VerifyOtpDto qo'shildi
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { secToMills } from "src/utils/time";
import { generateOtp } from "src/utils/random";
import { PrismaService } from "prisma/prisma.service";
import { SmsService } from "src/common/service/sms.service";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
    private redis: RedisService
  ) {}

  public getKey(type: EVerificationTypes, phone: string, confirmation = false): string {
    const storeKeys: Record<EVerificationTypes, string> = {
      [EVerificationTypes.REGISTER]: 'reg_',
      [EVerificationTypes.RESET_PASSWORD]: 'respass_',
      [EVerificationTypes.EDIT_PHONE]: 'edph_',
    };

    let key = storeKeys[type];
    if (confirmation) {
      key += 'cfm_';
    }
    key += phone;
    return key;
  }

  private getMessage(type: EVerificationTypes, otp: string): string {
    switch (type) {
      case EVerificationTypes.REGISTER:
        return `Blaze platformasidan ro'yxatdan o'tish uchun tasdiqlash kodi: ${otp}. kodni faqat menga ber`;
      case EVerificationTypes.RESET_PASSWORD:
        return `Blaze platformasida parolingizni tiklash uchun tasdiqlash kodi: ${otp}. kodni faqat menga ber`;
      case EVerificationTypes.EDIT_PHONE:
        return `Blaze platformasida telefoningizni o'zgartirish uchun tasdiqlash kodi: ${otp}. kodni faqat menga ber`;
      default:
        throw new HttpException('Unknown verification type', HttpStatus.BAD_REQUEST);
    }
  }

  private async throwIfUserExists(phone: string) {
    const user = await this.prisma.users.findUnique({
      where: { phone },
    });
    if (user) {
      throw new HttpException('Phone already used', HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  private async throwIfUserNotExists(phone: string) {
    const user = await this.prisma.users.findUnique({
      where: { phone },
    });
    if (!user) {
      throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async sendOtp(payload: SendOtpDto) {
    const { type, phone } = payload;
    const key = this.getKey(type, phone);
    const session = await this.redis.get(key);

    if (session) {
      throw new HttpException('Code already sent to user', HttpStatus.BAD_REQUEST);
    }

    switch (type) {
      case EVerificationTypes.REGISTER:
        await this.throwIfUserExists(phone);
        break;
      case EVerificationTypes.EDIT_PHONE:
      case EVerificationTypes.RESET_PASSWORD:
        await this.throwIfUserNotExists(phone);
        break;
      default:
        throw new HttpException('Invalid verification type', HttpStatus.BAD_REQUEST);
    }

    const otp = generateOtp();
    // Redis’da expiry vaqt sekundda kutiladi, secToMills esa ms qaytaryapti, to'g'ri shuni tekshiring!
    await this.redis.set(key, JSON.stringify({ otp }), secToMills(120) / 1000);
    await this.smsService.sendSMS(this.getMessage(type, otp), phone);

    return { message: 'Confirm code sent!' };
  }

  public async checkConfirmOtp(payload: ICheckOtp) {
    const { type, phone, otp } = payload;
    const session = await this.redis.get(this.getKey(type, phone, true));

    if (!session) {
      throw new HttpException('Session expired!', HttpStatus.BAD_REQUEST);
    }

    const data = JSON.parse(session);
    if (otp !== data.otp) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }

    await this.redis.del(this.getKey(type, phone, true));
    return true;
  }

  async verifyOtp(payload: VerifyOtpDto) {
    const { type, phone, otp } = payload;
    const session = await this.redis.get(this.getKey(type, phone));

    if (!session) {
      throw new HttpException('OTP expired!', HttpStatus.BAD_REQUEST);
    }

    const data = JSON.parse(session);
    if (otp !== data.otp) {
      throw new HttpException('Invalid OTP!', HttpStatus.BAD_REQUEST);
    }

    await this.redis.del(this.getKey(type, phone));
    await this.redis.set(
      this.getKey(type, phone, true),
      JSON.stringify({ otp }),
      secToMills(300) / 1000
    );

    return {
      success: true,
      message: 'Verified',
    };
  }
}
