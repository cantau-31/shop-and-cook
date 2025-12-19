import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokenPayload } from '../auth.constants';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.refreshSecret'),
      passReqToCallback: true
    });
  }

  validate(_req: Request, payload: TokenPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException({
        code: 'ERR_INVALID_REFRESH',
        message: 'Invalid refresh token'
      });
    }

    return {
      id: payload.sub,
      email: payload.email,
      displayName: payload.displayName,
      role: payload.role
    };
  }
}
