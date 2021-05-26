import { Module } from '@nestjs/common';
import { ClientModule } from '@swft-mt/client';
import { CloudModule } from '@swft-mt/cloud';
import { ConsulModule } from '@swft-mt/consul';
import { LoadBalancerModule } from '@swft-mt/loadbalancer';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    CloudModule.forRoot({
      registry: {
        discoverer: 'consul',
        service: {
          name: 'service-2',
          address: 'localhost',
          port: parseInt(process.env.PORT) || 3334,
        },
      },
    }),
    ConsulModule.forRoot({
      host: 'localhost',
      port: '8500',
      promisify: true,
      secure: false,
    }),
    ClientModule.forRoot(),
    LoadBalancerModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
