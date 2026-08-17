import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ViewerContextModule } from '@/modules/viewer-context/viewer-context.module';
import { BirthdaysController } from '@/modules/birthdays/birthdays.controller';
import { BirthdaysService } from '@/modules/birthdays/services/birthdays.service';

@Module({
  imports: [AuthModule, ViewerContextModule],
  controllers: [BirthdaysController],
  providers: [BirthdaysService],
})
export class BirthdaysModule {}
