import type { Provider } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

import { ApiConfigService } from './services/api-config.service.ts';
import { AwsS3Service } from './services/aws-s3.service.ts';
import { GeneratorService } from './services/generator.service.ts';
import { TranslationService } from './services/translation.service.ts';
import { ValidatorService } from './services/validator.service.ts';

const providers: Provider[] = [
  ApiConfigService,
  ValidatorService,
  AwsS3Service,
  GeneratorService,
  TranslationService,
  {
    provide: 'NATS_SERVICE',
    useFactory: (configService: ApiConfigService) => {
      const natsConfig = configService.natsConfig;

      try {
        return ClientProxyFactory.create({
          transport: Transport.NATS,
          options: {
            name: 'NATS_SERVICE',
            servers: [`nats://${natsConfig.host}:${natsConfig.port}`],
            timeout: 10_000, // 10 seconds timeout for requests
            maxReconnectAttempts: 10, // Retry connection 10 times
            reconnectTimeWait: 2000, // Wait 2 seconds between reconnection attempts
            waitOnFirstConnect: true, // Wait for initial connection
          },
        });
      } catch (error) {
        console.error('Failed to create NATS client:', error);

        throw error;
      }
    },
    inject: [ApiConfigService],
  },
  //   {
  //     provide: 'COMMON_SERVICE',
  //     useFactory: (configService: ApiConfigService) => {
  //       const commonSvcConfig = configService.commonSvcTcpOptions;

  //       return ClientProxyFactory.create({
  //         // @ts-expect-error: Transport.TCP is not typed correctly in the library
  //         transport: Transport.TCP,
  //         options: {
  //           host: commonSvcConfig.host,
  //           port: commonSvcConfig.port,
  //           retryAttempts: 5,
  //           retryDelay: 1000,
  //         },
  //       });
  //     },
  //     inject: [ApiConfigService],
  //   },
];

@Global()
@Module({
  providers,
  imports: [CqrsModule],
  exports: [...providers, CqrsModule],
})
export class SharedModule {}
