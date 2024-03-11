import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DataSource } from 'typeorm';
import { runSeeder } from 'typeorm-extension';
import { MainSeeder } from './seeds/MainSeeder';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const corsOptions: CorsOptions = {
    origin: process.env.URL_FRONT,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };
  app.enableCors(corsOptions);

  const dataSource = app.get<DataSource>(DataSource);
  await runSeeder(dataSource, MainSeeder);

  await app.listen(process.env.PORT);
}
bootstrap();
