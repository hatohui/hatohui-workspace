import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ADMIN_KEY_HEADER } from '@/common/utils/admin-key';
import { AdminGuard } from '@/modules/admin/guards/admin.guard';
import { AdminUsersService } from '@/modules/admin/services/admin-users.service';
import {
  AdminUserDto,
  UpdateAdminUserDto,
} from '@/modules/admin/dto/admin-user.dto';

@ApiTags('admin')
@Controller('admin/users')
@UseGuards(AdminGuard)
@ApiHeader({
  name: ADMIN_KEY_HEADER,
  required: true,
  description: 'Admin API key — required on every route in this controller',
})
export class AdminUsersController {
  constructor(private readonly adminUsers: AdminUsersService) {}

  @Get()
  @ApiOperation({
    operationId: 'adminListUsers',
    summary: 'Every user account, for the workspace admin dashboard',
  })
  @ApiOkResponse({ type: AdminUserDto, isArray: true })
  list(): Promise<AdminUserDto[]> {
    return this.adminUsers.list();
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'adminUpdateUser',
    summary: 'Edit a user account',
  })
  @ApiOkResponse({ type: AdminUserDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
  ): Promise<AdminUserDto> {
    return this.adminUsers.update(id, dto);
  }
}
