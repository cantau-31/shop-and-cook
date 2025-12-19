import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenPayload } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new UnauthorizedException({
        code: 'ERR_EMAIL_TAKEN',
        message: 'Email already registered',
      });
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      this.configService.get<number>('auth.bcryptSaltRounds', 11),
    );

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException({
        code: 'ERR_INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      });
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException({
        code: 'ERR_INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      });
    }

    return this.buildAuthResponse(user);
  }

  async refresh(user: TokenPayload) {
    return this.buildTokens(user);
  }

  private async buildAuthResponse(user: {
    id: string;
    email: string;
    displayName: string;
    role: 'USER' | 'ADMIN';
  }) {
    const tokens = await this.buildTokens({
      sub: String(user.id),
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
      ...tokens,
    };
  }

  private async buildTokens(payload: TokenPayload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(
        'auth.jwtSecret',
        'default-secret',
      ),
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(
        'auth.refreshSecret',
        'default-refresh-secret',
      ),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
