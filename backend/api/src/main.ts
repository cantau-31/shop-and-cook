import './polyfills';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  try {
    console.log('Starting application...');
    console.log('Environment variables:');
    console.log('- DB_HOST:', process.env.DB_HOST);
    console.log('- DB_PORT:', process.env.DB_PORT);
    console.log('- DB_USER:', process.env.DB_USER);
    console.log('- DB_NAME:', process.env.DB_NAME);
    console.log('- PORT:', process.env.PORT);

    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    app.use(helmet());
    app.enableCors({
      origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:4200',
      credentials: true
    });
    app.use(json({ limit: '1mb' }));
    app.use(urlencoded({ extended: true }));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true
      })
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.setGlobalPrefix('api/v1');

    const config = new DocumentBuilder()
      .setTitle('Shop & Cook API')
      .setDescription('REST API for Shop & Cook')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`Application is running on port ${port}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
}
bootstrap();
