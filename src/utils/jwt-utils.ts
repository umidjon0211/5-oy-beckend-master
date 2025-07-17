import { JwtSignOptions } from "@nestjs/jwt";

export const JWTAccessToken: JwtSignOptions = {
   secret: 'Osahddsf729\={(0',
   expiresIn: '1h'
} 

export const JWTRefreshToken: JwtSignOptions = {
    secret: 'u67wefejvjehvwe3[];/.--=',
    expiresIn: '1h'
}