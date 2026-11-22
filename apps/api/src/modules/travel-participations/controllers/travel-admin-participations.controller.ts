import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Query,
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
  TravelAdminGroupsQueryDto,
  TravelAdminGroupsResponseDto,
  TravelAdminStatsDto,
} from '@/modules/travel-participations/dto/travel-participation.dto';
import { TravelParticipationsService } from '@/modules/travel-participations/services/travel-participations.service';

@ApiTags('travel')
@Controller('travel/admin')
@UseGuards(TravelEditorGuard)
export class TravelAdminParticipationsController {
  constructor(private readonly participations: TravelParticipationsService) {}

  @Get('stats')
  @ApiOperation({ operationId: 'adminTravelStats' })
  @ApiOkResponse({ type: TravelAdminStatsDto })
  getStats(): Promise<TravelAdminStatsDto> {
    return this.participations.getAdminStats();
  }

  @Get('groups')
  @ApiOperation({ operationId: 'adminTravelGroups' })
  @ApiOkResponse({ type: TravelAdminGroupsResponseDto })
  listGroups(
    @Query() query: TravelAdminGroupsQueryDto,
  ): Promise<TravelAdminGroupsResponseDto> {
    return this.participations.listGroupsAdmin(query);
  }

  @Delete('groups/:id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'adminDeleteTravelGroup' })
  @ApiNoContentResponse()
  deleteGroup(@Param('id') id: string): Promise<void> {
    return this.participations.deleteGroupAdmin(id);
  }
}
