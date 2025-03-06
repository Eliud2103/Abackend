import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // El token expira según lo configurado en el módulo JWT
      secretOrKey: 'secreto', // Usa variables de entorno en producción
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email }; // Lo que estará disponible en req.user
  }
}
