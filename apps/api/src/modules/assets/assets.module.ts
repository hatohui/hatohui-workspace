import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
  imports: [AuthModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
