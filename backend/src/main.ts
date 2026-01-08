import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  app.set('trust proxy', 1);
  app.enableCors({
    origin: (origin: string, callback: (err: Error | null, origin?: boolean) => void) => {
      const allowedOrigins = [
        'http://localhost:3000',
        (process.env.FRONTEND_URL || '').replace(/\/$/, ''), // Remove trailing slash
        ...(process.env.CORS_ORIGINS || '').split(',').map(url => url.trim()),
      ].filter(Boolean);

      // Allow Vercel preview URLs dynamically
      const isVercelPreview = origin && origin.endsWith('.vercel.app');

      if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked origin: ${origin}. Allowed: ${JSON.stringify(allowedOrigins)}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  app.use(cookieParser());
  // app.setGlobalPrefix('api'); // Removed in favor of versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('Party Game API')
    .setDescription('The Party Game API description')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
