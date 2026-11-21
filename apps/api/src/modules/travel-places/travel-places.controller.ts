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
import { AdminRoleGuard } from '@/modules/auth/guards/admin-role.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import {
  MapsLinkPreviewDto,
  MapsLinkPreviewRequestDto,
} from '@/modules/travel-places/dto/maps-link-preview.dto';
import { TravelPlacesService } from '@/modules/travel-places/services/travel-places.service';
import {
  CreateTravelPlaceDto,
  TravelPlaceDetailDto,
  TravelPlaceDto,
  TravelPlaceQueryDto,
  UpdateTravelPlaceDto,
} from '@/modules/travel-places/dto/travel-place.dto';

@ApiTags('travel')
@Controller('travel/places')
export class TravelPlacesController {
  constructor(private readonly places: TravelPlacesService) {}

  @Get()
  @ApiOperation({ operationId: 'travelPlaces', summary: 'Every place' })
  @ApiOkResponse({ type: TravelPlaceDto, isArray: true })
  list(@Query() query: TravelPlaceQueryDto): Promise<TravelPlaceDto[]> {
    return this.places.list(query);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'travelPlace',
    summary: 'A place and every dish recommended there',
  })
  @ApiOkResponse({ type: TravelPlaceDetailDto })
  get(@Param('id') id: string): Promise<TravelPlaceDetailDto> {
    return this.places.get(id);
  }

  @Post()
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ operationId: 'createTravelPlace' })
  @ApiOkResponse({ type: TravelPlaceDetailDto })
  create(
    @Body() dto: CreateTravelPlaceDto,
    @CurrentUser() user: User,
  ): Promise<TravelPlaceDetailDto> {
    return this.places.create(dto, user.id);
  }

  @Post('link-preview')
  @HttpCode(200)
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    operationId: 'travelMapsLinkPreview',
    summary: 'Coordinates and place name from a Google Maps link',
  })
  @ApiOkResponse({ type: MapsLinkPreviewDto })
  previewLink(
    @Body() dto: MapsLinkPreviewRequestDto,
  ): Promise<MapsLinkPreviewDto> {
    return this.places.previewLink(dto.url);
  }

  @Patch(':id')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ operationId: 'updateTravelPlace' })
  @ApiOkResponse({ type: TravelPlaceDetailDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelPlaceDto,
  ): Promise<TravelPlaceDetailDto> {
    return this.places.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    operationId: 'deleteTravelPlace',
    summary: 'Delete a place and its recommendations',
  })
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.places.remove(id);
  }
}
