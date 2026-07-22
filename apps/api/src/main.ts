import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from '@/app.module';
import { buildOpenApiDocument } from '@/libs/openapi';
import type { Env } from '@/config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<Env, true>);

  app.enableCors({ origin: config.get('CORS_ORIGIN', { infer: true }) });

  const document = buildOpenApiDocument(app);
  app.use(
    '/docs',
    apiReference({ content: document, pageTitle: 'Hatohui API Reference' }),
  );

  await app.listen(config.get('PORT', { infer: true }));
}
void bootstrap();
