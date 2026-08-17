import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AdminController } from '@/modules/admin/admin.controller';
import { AdminGuard } from '@/modules/admin/guards/admin.guard';
import { AdminService } from '@/modules/admin/services/admin.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
  exports: [AdminService, AdminGuard],
})
export class AdminModule {}
