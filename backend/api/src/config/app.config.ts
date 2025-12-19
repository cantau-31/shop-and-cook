import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:4200'
}));
