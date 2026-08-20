import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AdminBirthdaysController } from '@/modules/admin/controllers/admin-birthdays.controller';
import { AdminUsersController } from '@/modules/admin/controllers/admin-users.controller';
import { AdminGuard } from '@/modules/admin/guards/admin.guard';
import { AdminService } from '@/modules/admin/services/admin.service';
import { AdminUsersService } from '@/modules/admin/services/admin-users.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminBirthdaysController, AdminUsersController],
  providers: [AdminService, AdminUsersService, AdminGuard],
  exports: [AdminService, AdminUsersService, AdminGuard],
})
export class AdminModule {}
