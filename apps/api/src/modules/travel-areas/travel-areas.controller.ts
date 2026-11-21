import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { TravelEditorGuard } from '@/modules/travel-access/guards/travel-editor.guard';
import { TravelAreasService } from '@/modules/travel-areas/services/travel-areas.service';
import {
  BulkCreateTravelAreasDto,
  TravelAreaDto,
  UpdateTravelAreaDto,
} from '@/modules/travel-areas/dto/travel-area.dto';
import { TravelBulkResultDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';

@ApiTags('travel')
@Controller('travel/areas')
@UseGuards(TravelEditorGuard)
export class TravelAreasController {
  constructor(private readonly areas: TravelAreasService) {}

  @Post('bulk')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'bulkCreateTravelAreas',
    summary: 'Add several areas to a country by name',
  })
  @ApiOkResponse({ type: TravelBulkResultDto })
  bulkCreate(
    @Body() dto: BulkCreateTravelAreasDto,
    @CurrentUser() user: User,
  ): Promise<TravelBulkResultDto> {
    return this.areas.bulkCreate(dto.countryId, dto.names, user.id);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'updateTravelArea' })
  @ApiOkResponse({ type: TravelAreaDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelAreaDto,
  ): Promise<TravelAreaDto> {
    return this.areas.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteTravelArea',
    summary: 'Delete an area; its places keep existing, unassigned',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.areas.remove(id);
  }
}
