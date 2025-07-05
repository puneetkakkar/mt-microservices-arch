import { Module } from '@nestjs/common';
import { ClientModule } from '@swft-mt/client';
import { CloudModule } from '@swft-mt/cloud';
import { ConsulModule } from '@swft-mt/consul';
import { LoadBalancerModule } from '@swft-mt/loadbalancer';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConsulModule.forRoot({
      host: 'localhost',
      port: '8500',
      promisify: true,
      secure: false,
    }),
    CloudModule.forRoot({
      registry: {
        discoverer: 'consul',
        service: {
          name: 'service-2',
          address: 'localhost',
          port: parseInt(process.env.PORT) || 3334,
        },
        discovery: {
          type: 'http',
          http: `http://host.docker.internal:${process.env.PORT || 3334}/api/health`,
          interval: 10,
          timeout: '5',
          failFast: false,
          scheme: 'http',
        },
        heartbeat: {
          enabled: false,
          ttlInSeconds: 30,
        },
      },
    }),
    ClientModule.forRoot(),
    LoadBalancerModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
