import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ImagesController } from '@/modules/images/images.controller';
import { ImagesService } from '@/modules/images/services/images.service';
import { ImageUploadLimitsService } from '@/modules/images/services/image-upload-limits.service';

@Module({
  imports: [AuthModule],
  controllers: [ImagesController],
  providers: [ImagesService, ImageUploadLimitsService],
  exports: [ImagesService],
})
export class ImagesModule {}
