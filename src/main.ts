import './boilerplate.polyfill';

import {
  ClassSerializerInterceptor,
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import compression from 'compression';
import { middleware as expressCtx } from 'express-ctx';
import helmet from 'helmet';
import morgan from 'morgan';
import { initializeTransactionalContext } from 'typeorm-transactional';

import { AppModule } from './app.module.ts';
import { HttpExceptionFilter } from './filters/bad-request.filter.ts';
import { GlobalHttpExceptionFilter } from './filters/http-exception.filter.ts';
import { QueryFailedFilter } from './filters/query-failed.filter.ts';
import { TranslationInterceptor } from './interceptors/translation-interceptor.service.ts';
import { setupSwagger } from './setup-swagger.ts';
import { ApiConfigService } from './shared/services/api-config.service.ts';
import { TranslationService } from './shared/services/translation.service.ts';
import { SharedModule } from './shared/shared.module.ts';

export async function bootstrap(): Promise<NestExpressApplication> {
  initializeTransactionalContext();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      cors: {
        origin: process.env.CORS_ORIGINS?.split(',') ?? [
          'http://localhost:3000',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
      },
    },
  );
  app.enable('trust proxy');
  app.use(helmet());
  app.setGlobalPrefix('/svc');
  app.use(compression());
  app.use(morgan('combined'));
  app.enableVersioning();
  app.use(expressCtx);

  const reflector = app.get(Reflector);

  // biome-ignore lint/correctness/useHookAtTopLevel: NestJS method, not a React hook
  app.useGlobalFilters(
    new GlobalHttpExceptionFilter(),
    new HttpExceptionFilter(reflector),
    new QueryFailedFilter(reflector),
  );

  // biome-ignore lint/correctness/useHookAtTopLevel: NestJS method, not a React hook
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new TranslationInterceptor(
      app.select(SharedModule).get(TranslationService),
    ),
  );

  // biome-ignore lint/correctness/useHookAtTopLevel: NestJS method, not a React hook
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  const configService = app.select(SharedModule).get(ApiConfigService);

  // only start nats if it is enabled
  if (configService.natsEnabled) {
    const natsConfig = configService.natsConfig;
    app.connectMicroservice({
      transport: Transport.NATS,
      options: {
        url: `nats://${natsConfig.host}:${natsConfig.port}`,
        queue: 'main_service',
      },
    });
  }

  const transportPort = configService.tcpTransportPort;
  app.connectMicroservice({
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: transportPort.port },
  });

  await app.startAllMicroservices();

  if (configService.documentationEnabled) {
    setupSwagger(app);
  }

  app.use(expressCtx);

  // Starts listening for shutdown hooks
  if (!configService.isDevelopment) {
    app.enableShutdownHooks();
  }

  const port = configService.appConfig.port;
  await app.listen(port);

  console.info(
    `server running on http://localhost:${port}/svc/template/documentation#`,
  );

  return app;
}

export const viteNodeApp = bootstrap();
