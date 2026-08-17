import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function buildOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Hatohui API')
    .setDescription('OpenAPI specification for the Hatohui workspace API')
    .setVersion('0.1.0')
    .addTag('auth')
    .addTag('friends')
    .addTag('health')
    .addTag('images')
    .addTag('platforms')
    .addTag('onboarding')
    .addTag('assets')
    .addTag('commissions')
    .addTag('commission-pricing')
    .addTag('projects')
    .build();

  return SwaggerModule.createDocument(app, config);
}
