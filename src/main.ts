import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ValidationExceptionFilter } from '@common/filters/validation-exception.filter';
import { ResponseInterceptor } from '@common/interceptors/response-message.interceptor';
import { raw } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: true,
  });
  app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));
  app.enableCors();
  app.use('/plans/webhook', raw({ type: '*/*' }));

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new ValidationExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
  console.log('App is listening on port:', process.env.PORT);
}
bootstrap();
