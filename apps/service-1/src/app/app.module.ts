import { Module } from '@nestjs/common';
import { BootstrapModule } from '@swft-mt/bootstrap';
import { ClientModule } from '@swft-mt/client';
import { CloudModule } from '@swft-mt/cloud';
import { ConsulModule } from '@swft-mt/consul';
import { LoadBalancerModule } from '@swft-mt/loadbalancer';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    BootstrapModule.forRoot(),
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
          name: 'service-1',
          address: 'localhost',
          port: parseInt(process.env.PORT) || 3333,
        },
        discovery: {
          type: 'http',
          http: `http://${process.env.SERVICE_IP || 'host.docker.internal'}:${process.env.PORT || 3333}/api/health`,
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
