import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ImagesController } from '@/modules/images/images.controller';
import { ImagesService } from '@/modules/images/services/images.service';

@Module({
  imports: [AuthModule],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
