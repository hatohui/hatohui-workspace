import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { buildOpenApiDocument } from '@/bootstrap/openapi';

async function run() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const document = buildOpenApiDocument(app);
  await app.close();
  process.stdout.write(JSON.stringify(document, null, 2));
}

void run();
