import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { TravelEditorGuard } from '@/modules/travel-access/guards/travel-editor.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { TravelBulkResultDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { TravelSpotsService } from '@/modules/travel-spots/services/travel-spots.service';
import {
  BulkCreateTravelSpotsDto,
  CreateTravelSpotDto,
  PaginatedTravelSpotsDto,
  TravelSpotDto,
  TravelSpotPageQueryDto,
  TravelSpotQueryDto,
  UpdateTravelSpotDto,
} from '@/modules/travel-spots/dto/travel-spot.dto';

@ApiTags('travel')
@Controller('travel/spots')
export class TravelSpotsController {
  constructor(private readonly spots: TravelSpotsService) {}

  @Get()
  @ApiOperation({ operationId: 'travelSpots', summary: 'Every activity spot' })
  @ApiOkResponse({ type: TravelSpotDto, isArray: true })
  list(@Query() query: TravelSpotQueryDto): Promise<TravelSpotDto[]> {
    return this.spots.list(query);
  }

  @Get('page')
  @ApiOperation({
    operationId: 'travelSpotsPage',
    summary: 'Paginated activity spots',
  })
  @ApiOkResponse({ type: PaginatedTravelSpotsDto })
  listPage(
    @Query() query: TravelSpotPageQueryDto,
  ): Promise<PaginatedTravelSpotsDto> {
    return this.spots.listPage(query);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'travelSpot',
    summary: 'An activity spot with its photos, tags, and location',
  })
  @ApiOkResponse({ type: TravelSpotDto })
  get(@Param('id') id: string): Promise<TravelSpotDto> {
    return this.spots.get(id);
  }

  @Post('bulk')
  @HttpCode(200)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'bulkCreateTravelSpots',
    summary: 'Add several activity spots by name or Google Maps link',
  })
  @ApiOkResponse({ type: TravelBulkResultDto })
  bulkCreate(
    @Body() dto: BulkCreateTravelSpotsDto,
    @CurrentUser() user: User,
  ): Promise<TravelBulkResultDto> {
    return this.spots.bulkCreate(dto.names, dto.areaId, user.id);
  }

  @Post()
  @UseGuards(TravelEditorGuard)
  @ApiOperation({ operationId: 'createTravelSpot' })
  @ApiOkResponse({ type: TravelSpotDto })
  create(
    @Body() dto: CreateTravelSpotDto,
    @CurrentUser() user: User,
  ): Promise<TravelSpotDto> {
    return this.spots.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(TravelEditorGuard)
  @ApiOperation({ operationId: 'updateTravelSpot' })
  @ApiOkResponse({ type: TravelSpotDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelSpotDto,
    @CurrentUser() user: User,
  ): Promise<TravelSpotDto> {
    return this.spots.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(TravelEditorGuard)
  @ApiOperation({
    operationId: 'deleteTravelSpot',
    summary: 'Delete an activity spot and its photos',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.spots.remove(id);
  }
}
