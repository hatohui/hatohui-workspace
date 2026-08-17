import { Module } from '@nestjs/common';
import { BirthdayConfigService } from './birthday-config';

@Module({
  providers: [BirthdayConfigService],
  exports: [BirthdayConfigService],
})
export class BirthdayConfigModule {}
