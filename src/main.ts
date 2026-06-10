import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Retail ERP API')
    .setDescription('Multi-tenant Retail ERP SaaS — do\'kon boshqaruv tizimi')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('auth', 'Autentifikatsiya')
    .addTag('company', 'Kompaniya')
    .addTag('users', 'Xodimlar')
    .addTag('categories', 'Kategoriyalar')
    .addTag('products', 'Mahsulotlar')
    .addTag('customers', 'Mijozlar')
    .addTag('sales', 'Sotuvlar')
    .addTag('payments', "To'lovlar")
    .addTag('debts', 'Qarzlar')
    .addTag('inventory', 'Ombor')
    .addTag('dashboard', 'Dashboard')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}/api`);
  console.log(`Swagger docs:           http://localhost:${port}/api/docs`);
}

bootstrap();
