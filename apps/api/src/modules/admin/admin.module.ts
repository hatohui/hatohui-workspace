import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AdminBirthdaysController } from '@/modules/admin/controllers/admin-birthdays.controller';
import { AdminUsersController } from '@/modules/admin/controllers/admin-users.controller';
import { AdminSystemParametersController } from '@/modules/admin/controllers/admin-system-parameters.controller';
import { AdminGuard } from '@/modules/admin/guards/admin.guard';
import { AdminService } from '@/modules/admin/services/admin.service';
import { AdminUsersService } from '@/modules/admin/services/admin-users.service';
import { AdminSystemParametersService } from '@/modules/admin/services/admin-system-parameters.service';

@Module({
  imports: [AuthModule],
  controllers: [
    AdminBirthdaysController,
    AdminUsersController,
    AdminSystemParametersController,
  ],
  providers: [
    AdminService,
    AdminUsersService,
    AdminSystemParametersService,
    AdminGuard,
  ],
  exports: [
    AdminService,
    AdminUsersService,
    AdminSystemParametersService,
    AdminGuard,
  ],
})
export class AdminModule {}
