import { BadRequestException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { randomBytes, createHash } from 'crypto';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenPayload } from './auth.constants';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepo: Repository<PasswordResetToken>,
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
      privacyAcceptedAt: new Date(),
      privacyPolicyVersion: dto.privacyPolicyVersion,
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
    const entity = await this.usersService.findById(user.sub);
    if (!entity) {
      throw new UnauthorizedException({
        code: 'ERR_INVALID_REFRESH',
        message: 'Invalid refresh token',
      });
    }
    return this.buildAuthResponse(entity);
  }

  async requestPasswordReset(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (user) {
      const token = await this.createResetToken(user);
      this.logger.log(`Password reset token for ${user.email}: ${token}`);
      if (process.env.NODE_ENV === 'production') {
        return { success: true };
      }
      return { success: true, resetToken: token };
    }
    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashed = createHash('sha256').update(dto.token).digest('hex');
    const resetToken = await this.resetTokenRepo.findOne({
      where: { tokenHash: hashed },
      relations: ['user']
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new BadRequestException({
        code: 'ERR_INVALID_RESET_TOKEN',
        message: 'Invalid or expired reset token'
      });
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      this.configService.get<number>('auth.bcryptSaltRounds', 11)
    );

    await Promise.all([
      this.usersService.updatePassword(resetToken.userId, passwordHash),
      this.resetTokenRepo.update(resetToken.id, { usedAt: new Date() })
    ]);

    this.logger.log(`Password reset completed for ${resetToken.user.email}`);

    return { success: true };
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

  private async createResetToken(user: User) {
    await this.resetTokenRepo.delete({ userId: user.id });
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const entity = this.resetTokenRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt
    });
    await this.resetTokenRepo.save(entity);

    return rawToken;
  }
}
