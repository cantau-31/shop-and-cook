import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET ?? 'secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  refreshSecret: process.env.REFRESH_SECRET ?? 'refresh',
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN ?? '7d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '11', 10)
}));
