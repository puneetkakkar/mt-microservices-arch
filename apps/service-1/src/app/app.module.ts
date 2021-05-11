import { Module } from '@nestjs/common';
import { BootstrapModule } from '@swft-mt/bootstrap';
import { CloudModule } from '@swft-mt/cloud';
import { ConsulModule } from '@swft-mt/consul';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    CloudModule.forRoot({
      registry: {
        discoverer: 'consul',
        service: {
          name: 'service-1',
          address: 'localhost',
          port: 3333,
        },
      },
    }),
    ConsulModule.forRoot({
      host: 'localhost',
      port: '8500',
      promisify: true,
      secure: false,
    }),
    BootstrapModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
