import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ADMIN_KEY_HEADER } from '@/common/utils/admin-key';
import { AdminGuard } from '@/modules/admin/guards/admin.guard';
import { AdminSystemParametersService } from '@/modules/admin/services/admin-system-parameters.service';
import {
  AdminSystemParameterDto,
  UpdateAdminSystemParameterDto,
} from '@/modules/admin/dto/admin-system-parameter.dto';

@ApiTags('admin')
@Controller('admin/system-parameters')
@UseGuards(AdminGuard)
@ApiHeader({
  name: ADMIN_KEY_HEADER,
  required: true,
  description: 'Admin API key — required on every route in this controller',
})
export class AdminSystemParametersController {
  constructor(
    private readonly adminSystemParameters: AdminSystemParametersService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'adminListSystemParameters',
    summary:
      'Every app-wide configuration value, for the workspace admin dashboard',
  })
  @ApiOkResponse({ type: AdminSystemParameterDto, isArray: true })
  list(): Promise<AdminSystemParameterDto[]> {
    return this.adminSystemParameters.list();
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'adminUpdateSystemParameter',
    summary: 'Edit a configuration value',
  })
  @ApiOkResponse({ type: AdminSystemParameterDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminSystemParameterDto,
  ): Promise<AdminSystemParameterDto> {
    return this.adminSystemParameters.update(id, dto);
  }
}
