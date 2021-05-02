import { NestFactory } from '@nestjs/core';
import { Service1Module } from './service-1.module';

async function bootstrap() {
  const app = await NestFactory.create(Service1Module);
  await app.listen(3000);
}
bootstrap();
