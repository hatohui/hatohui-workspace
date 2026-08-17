import { Module } from '@nestjs/common';
import { BirthdayConfigService } from '@/modules/cron/services/birthday-config.service';

@Module({
  providers: [BirthdayConfigService],
  exports: [BirthdayConfigService],
})
export class BirthdayConfigModule {}
