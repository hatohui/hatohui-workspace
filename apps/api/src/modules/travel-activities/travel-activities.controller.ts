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
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { OptionalAuthGuard } from '@/modules/auth/guards/optional-auth.guard';
import {
  CreateTravelActivityDto,
  CreateTravelMediaDto,
  TravelActivityDto,
  TravelMediaItemDto,
  TravelMediaQueryDto,
  UpdateTravelActivityDto,
} from '@/modules/travel-activities/dto/travel-activity.dto';
import { TravelActivitiesService } from '@/modules/travel-activities/services/travel-activities.service';

@ApiTags('travel')
@Controller('travel/participations/:id')
export class TravelActivitiesController {
  constructor(private readonly activities: TravelActivitiesService) {}

  @Get('activities')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ operationId: 'travelActivities' })
  @ApiOkResponse({ type: TravelActivityDto, isArray: true })
  listActivities(
    @Param('id') id: string,
    @CurrentUser() user?: User,
  ): Promise<TravelActivityDto[]> {
    return this.activities.listActivities(id, user?.id);
  }

  @Post('activities')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'createTravelActivity' })
  @ApiOkResponse({ type: TravelActivityDto })
  createActivity(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: CreateTravelActivityDto,
  ): Promise<TravelActivityDto> {
    return this.activities.createActivity(id, user.id, dto);
  }

  @Patch('activities/:activityId')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'updateTravelActivity' })
  @ApiOkResponse({ type: TravelActivityDto })
  updateActivity(
    @Param('id') id: string,
    @Param('activityId') activityId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateTravelActivityDto,
  ): Promise<TravelActivityDto> {
    return this.activities.updateActivity(id, activityId, user.id, dto);
  }

  @Delete('activities/:activityId')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'deleteTravelActivity' })
  @ApiNoContentResponse()
  deleteActivity(
    @Param('id') id: string,
    @Param('activityId') activityId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.activities.deleteActivity(id, activityId, user.id);
  }

  @Get('gallery')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ operationId: 'travelPlanGallery' })
  @ApiOkResponse({ type: TravelMediaItemDto, isArray: true })
  listGallery(
    @Param('id') id: string,
    @Query() query: TravelMediaQueryDto,
    @CurrentUser() user?: User,
  ): Promise<TravelMediaItemDto[]> {
    return this.activities.listGallery(id, query, user?.id);
  }

  @Post('images')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'addTravelGroupImage' })
  @ApiOkResponse({ type: TravelMediaItemDto })
  addGroupImage(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: CreateTravelMediaDto,
  ): Promise<TravelMediaItemDto> {
    return this.activities.addGroupImage(id, user.id, dto);
  }

  @Delete('images/:imageId')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'deleteTravelGroupImage' })
  @ApiNoContentResponse()
  deleteGroupImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.activities.deleteGroupImage(id, imageId, user.id);
  }

  @Post('activities/:activityId/media')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'addTravelActivityMedia' })
  @ApiOkResponse({ type: TravelMediaItemDto })
  addActivityMedia(
    @Param('id') id: string,
    @Param('activityId') activityId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateTravelMediaDto,
  ): Promise<TravelMediaItemDto> {
    return this.activities.addActivityMedia(id, activityId, user.id, dto);
  }

  @Delete('activities/:activityId/media/:mediaId')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'deleteTravelActivityMedia' })
  @ApiNoContentResponse()
  deleteActivityMedia(
    @Param('id') id: string,
    @Param('activityId') activityId: string,
    @Param('mediaId') mediaId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.activities.deleteActivityMedia(
      id,
      activityId,
      mediaId,
      user.id,
    );
  }
}
