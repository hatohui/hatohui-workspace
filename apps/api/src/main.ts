import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';
import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from '@/app.module';
import { buildOpenApiDocument } from '@/libs/openapi';
import type { Env } from '@/config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<Env, true>);

  app.use(cookieParser());
  app.enableCors({
    origin: config.get('CORS_ORIGIN', { infer: true }),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const document = buildOpenApiDocument(app);

  app.use('/', (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/') {
      res.redirect('/docs');
      return;
    }
    next();
  });

  app.use(
    '/docs',
    apiReference({ content: document, pageTitle: 'Hatohui API Reference' }),
  );

  await app.listen(config.get('PORT', { infer: true }));
}
void bootstrap();
