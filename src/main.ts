import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './config/swagger.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalPipes(new ValidationPipe())

  await setupSwagger(app)

  
  await app.listen(process.env.PORT ?? 5910);
  console.log(`http://localhost:5910/umidjon`);
  
}