import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
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
  AdminUserQueryDto,
  PaginatedAdminUsersDto,
  UpdateAdminUserDto,
} from '@/modules/admin/dto/admin-user.dto';
import {
  DEFAULT_ADMIN_PAGE,
  DEFAULT_ADMIN_PAGE_SIZE,
  ADMIN_USER_DEFAULT_SORT,
  ADMIN_DEFAULT_SORT_DIRECTION,
} from '@/modules/admin/admin.constants';

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
    summary: 'Every user account, paginated, for the workspace admin dashboard',
  })
  @ApiOkResponse({ type: PaginatedAdminUsersDto })
  list(@Query() query: AdminUserQueryDto): Promise<PaginatedAdminUsersDto> {
    return this.adminUsers.list(
      query.query,
      query.onboardingStatus,
      query.sort ?? ADMIN_USER_DEFAULT_SORT,
      query.direction ?? ADMIN_DEFAULT_SORT_DIRECTION,
      query.page ?? DEFAULT_ADMIN_PAGE,
      query.pageSize ?? DEFAULT_ADMIN_PAGE_SIZE,
    );
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
