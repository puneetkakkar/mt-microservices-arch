import { Module } from '@nestjs/common';
import { ClientModule } from '@nexuskit/client';
import { CloudModule } from '@nexuskit/cloud';
import { LoadBalancerModule } from '@nexuskit/loadbalancer';
import { ZookeeperModule } from '@nexuskit/zookeeper';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
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
          id: `service-2-${process.env.PORT || 3334}`,
          name: 'service-2',
          address: 'localhost',
          port: parseInt(process.env.PORT) || 3334,
        },
        discovery: {
          type: 'http',
          http: `http://${process.env.SERVICE_IP || 'host.docker.internal'}:${process.env.PORT || 3334}/api/health`,
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
