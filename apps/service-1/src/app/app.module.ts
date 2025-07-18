import { Module } from '@nestjs/common';
import { BootstrapModule } from '@nexuskit/bootstrap';
import { ClientModule } from '@nexuskit/client';
import { CloudModule } from '@nexuskit/cloud';
import { LoadBalancerModule } from '@nexuskit/loadbalancer';
import { ZookeeperModule } from '@nexuskit/zookeeper';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    BootstrapModule.forRoot(),
    // ConsulModule.forRoot({
    //   host: 'localhost',
    //   port: '8500',
    //   promisify: true,
    //   secure: false,
    // }),
    ZookeeperModule.forRoot({
      host: 'localhost:2181',
      retryAttempts: 6000,
    }),
    CloudModule.forRoot({
      registry: {
        discoverer: 'zookeeper',
        service: {
          id: `service-1-${process.env.PORT || 3333}`,
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
