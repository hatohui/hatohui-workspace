import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AssetsController } from '@/modules/assets/assets.controller';
import { AssetsService } from '@/modules/assets/services/assets.service';

@Module({
  imports: [AuthModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
