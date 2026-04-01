import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/users/auth/v1/auth.module';
import { UsersModule } from './modules/users/users/v1/users.module';
import { AdminAuthModule } from './modules/admin/v1/auth/auth.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggerModule } from './modules/logger/logger.module';
import { I18nModule, AcceptLanguageResolver, HeaderResolver } from 'nestjs-i18n';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RateLimiterGuard } from './common/guard/rate-limiter.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, 'i18n'),
        watch: true,
      },
      resolvers: [
        new HeaderResolver(['x-custom-lang']),
        AcceptLanguageResolver,
      ],
    }),
    RedisModule,
    LoggerModule,
    AuthModule,
    UsersModule,
    AdminAuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
})
export class AppModule {}