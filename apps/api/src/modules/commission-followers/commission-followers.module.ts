import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { CommissionFollowersController } from '@/modules/commission-followers/commission-followers.controller';
import { CommissionFollowersService } from '@/modules/commission-followers/services/commission-followers.service';

@Module({
  imports: [AuthModule],
  controllers: [CommissionFollowersController],
  providers: [CommissionFollowersService],
})
export class CommissionFollowersModule {}
