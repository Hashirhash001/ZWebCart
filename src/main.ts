import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  // Middleware to log request body
  app.use((req, res, next) => {
    if (req.method === 'POST') {
      Logger.log('Request Body:', JSON.stringify(req.body), 'RequestLogger');
    }
    next();
  });
  
  await app.listen(3000);
}
bootstrap();
