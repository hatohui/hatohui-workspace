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
import { AdminProfilesService } from '@/modules/admin/services/admin-profiles.service';
import {
  AdminProfileDto,
  AdminProfileQueryDto,
  PaginatedAdminProfilesDto,
  UpdateAdminProfileDto,
} from '@/modules/admin/dto/admin-profile.dto';
import {
  ADMIN_PROFILE_DEFAULT_SORT,
  ADMIN_PROFILE_DEFAULT_SORT_DIRECTION,
  DEFAULT_ADMIN_PAGE,
  DEFAULT_ADMIN_PAGE_SIZE,
} from '@/modules/admin/admin.constants';

@ApiTags('admin')
@Controller('admin/profiles')
@UseGuards(AdminGuard)
@ApiHeader({
  name: ADMIN_KEY_HEADER,
  required: true,
  description: 'Admin API key — required on every route in this controller',
})
export class AdminProfilesController {
  constructor(private readonly adminProfiles: AdminProfilesService) {}

  @Get()
  @ApiOperation({
    operationId: 'adminListProfiles',
    summary:
      'Every directory entry (profile + birthday), ignoring visibility, paginated',
  })
  @ApiOkResponse({ type: PaginatedAdminProfilesDto })
  list(
    @Query() query: AdminProfileQueryDto,
  ): Promise<PaginatedAdminProfilesDto> {
    return this.adminProfiles.list(
      query.query,
      query.sort ?? ADMIN_PROFILE_DEFAULT_SORT,
      query.direction ?? ADMIN_PROFILE_DEFAULT_SORT_DIRECTION,
      query.page ?? DEFAULT_ADMIN_PAGE,
      query.pageSize ?? DEFAULT_ADMIN_PAGE_SIZE,
    );
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'adminUpdateProfile',
    summary: 'Edit a directory entry',
  })
  @ApiOkResponse({ type: AdminProfileDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminProfileDto,
  ): Promise<AdminProfileDto> {
    return this.adminProfiles.update(id, dto);
  }
}
