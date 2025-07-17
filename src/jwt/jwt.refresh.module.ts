import { Global, Module } from "@nestjs/common";
import { JWTRefreshToken } from "../utils/jwt-utils";
import { JwtModule } from "@nestjs/jwt";

@Global()
@Module({
    imports: [JwtModule.register(JWTRefreshToken)]
})

export class JwtRefreshTokenModule {}