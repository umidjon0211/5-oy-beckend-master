import { Global, Module } from "@nestjs/common";
import { JWTAccessToken } from "../utils/jwt-utils";
import { JwtModule } from "@nestjs/jwt";

@Global()
@Module({
    imports: [JwtModule.register(JWTAccessToken)]
})

export class JwtAccessTokenModule {}