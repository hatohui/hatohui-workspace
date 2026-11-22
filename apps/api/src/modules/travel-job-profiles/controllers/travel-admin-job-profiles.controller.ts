import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TravelEditorGuard } from '@/modules/travel-access/guards/travel-editor.guard';
import {
  AdminUpsertTravelJobProfileDto,
  TravelJobProfileDto,
  UpsertTravelJobProfileDto,
} from '@/modules/travel-job-profiles/dto/travel-job-profile.dto';
import { TravelJobProfilesService } from '@/modules/travel-job-profiles/services/travel-job-profiles.service';

@ApiTags('travel')
@Controller('travel/admin/job-profiles')
@UseGuards(TravelEditorGuard)
export class TravelAdminJobProfilesController {
  constructor(private readonly jobProfiles: TravelJobProfilesService) {}

  @Get()
  @ApiOperation({ operationId: 'adminTravelJobProfiles' })
  @ApiOkResponse({ type: TravelJobProfileDto, isArray: true })
  listAll(): Promise<TravelJobProfileDto[]> {
    return this.jobProfiles.listAll();
  }

  @Put()
  @ApiOperation({ operationId: 'adminUpsertTravelJobProfile' })
  @ApiOkResponse({ type: TravelJobProfileDto })
  upsert(
    @Body() dto: AdminUpsertTravelJobProfileDto,
  ): Promise<TravelJobProfileDto> {
    return this.jobProfiles.adminUpsert(dto);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'adminUpdateTravelJobProfile' })
  @ApiOkResponse({ type: TravelJobProfileDto })
  updateById(
    @Param('id') id: string,
    @Body() dto: UpsertTravelJobProfileDto,
  ): Promise<TravelJobProfileDto> {
    return this.jobProfiles.adminUpdateById(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'adminDeleteTravelJobProfile' })
  @ApiNoContentResponse()
  removeById(@Param('id') id: string): Promise<void> {
    return this.jobProfiles.adminRemoveById(id);
  }
}
