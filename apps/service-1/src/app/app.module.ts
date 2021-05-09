import { Module } from '@nestjs/common';
import { BootstrapModule } from '@swft-mt/bootstrap';
import { ConsulModule } from '@swft-mt/consul';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    BootstrapModule.forRoot(),
    ConsulModule.forRoot({
      host: 'localhost',
      port: '8500',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
