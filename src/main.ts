import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use((req: any, res: any, next: any) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
  });
  app.enableCors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  });
  
  app.setBaseViewsDir(join(__dirname, 'common', 'templates'));
  app.setViewEngine('hbs');

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const port = process.env.PORT ?? 3000;

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pickam API')
    .setDescription('API documentation for all currently available endpoints')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer(`http://localhost:${port}/`, 'Local Environment')
    .addServer('https://dev-api.pickam.com/', 'Development Environment')
    .addServer('https://api.pickam.com/', 'Production Environment')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(port);
}
bootstrap();
