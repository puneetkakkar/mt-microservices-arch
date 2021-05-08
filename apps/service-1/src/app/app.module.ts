import { Module } from '@nestjs/common';
import { BootstrapModule } from '@swft-mt/bootstrap';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [BootstrapModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}