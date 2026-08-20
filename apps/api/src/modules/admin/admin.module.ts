import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AdminProfilesController } from '@/modules/admin/controllers/admin-profiles.controller';
import { AdminUsersController } from '@/modules/admin/controllers/admin-users.controller';
import { AdminSystemParametersController } from '@/modules/admin/controllers/admin-system-parameters.controller';
import { AdminGuard } from '@/modules/admin/guards/admin.guard';
import { AdminProfilesService } from '@/modules/admin/services/admin-profiles.service';
import { AdminUsersService } from '@/modules/admin/services/admin-users.service';
import { AdminSystemParametersService } from '@/modules/admin/services/admin-system-parameters.service';

@Module({
  imports: [AuthModule],
  controllers: [
    AdminProfilesController,
    AdminUsersController,
    AdminSystemParametersController,
  ],
  providers: [
    AdminProfilesService,
    AdminUsersService,
    AdminSystemParametersService,
    AdminGuard,
  ],
  exports: [
    AdminProfilesService,
    AdminUsersService,
    AdminSystemParametersService,
    AdminGuard,
  ],
})
export class AdminModule {}
