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
  CreateTravelEventDto,
  TravelEventCalendarQueryDto,
  TravelEventDto,
  TravelEventQueryDto,
  TravelMyEventParticipationDto,
  UpdateTravelEventDto,
} from '@/modules/travel-events/dto/travel-event.dto';
import { TravelEventsService } from '@/modules/travel-events/services/travel-events.service';

@ApiTags('travel')
@Controller('travel/events')
export class TravelEventsController {
  constructor(private readonly events: TravelEventsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ operationId: 'travelEvents' })
  @ApiOkResponse({ type: TravelEventDto, isArray: true })
  list(
    @Query() query: TravelEventQueryDto,
    @CurrentUser() user?: User,
  ): Promise<TravelEventDto[]> {
    return this.events.list(query, user?.id);
  }

  @Get('upcoming')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ operationId: 'upcomingTravelEvents' })
  @ApiOkResponse({ type: TravelEventDto, isArray: true })
  listUpcoming(@CurrentUser() user?: User): Promise<TravelEventDto[]> {
    return this.events.listUpcoming(undefined, user?.id);
  }

  @Get('calendar')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ operationId: 'travelEventsCalendar' })
  @ApiOkResponse({ type: TravelEventDto, isArray: true })
  listCalendar(
    @Query() query: TravelEventCalendarQueryDto,
    @CurrentUser() user?: User,
  ): Promise<TravelEventDto[]> {
    return this.events.listCalendar(query.from, query.to, user?.id);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ operationId: 'travelEvent' })
  @ApiOkResponse({ type: TravelEventDto })
  get(
    @Param('id') id: string,
    @CurrentUser() user?: User,
  ): Promise<TravelEventDto> {
    return this.events.get(id, user);
  }

  @Get(':id/my-participation')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'myTravelEventParticipation' })
  @ApiOkResponse({ type: TravelMyEventParticipationDto })
  getMyParticipation(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<TravelMyEventParticipationDto> {
    return this.events.getMyParticipation(id, user.id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'createTravelEvent' })
  @ApiOkResponse({ type: TravelEventDto })
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateTravelEventDto,
  ): Promise<TravelEventDto> {
    return this.events.create(user, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'updateTravelEvent' })
  @ApiOkResponse({ type: TravelEventDto })
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateTravelEventDto,
  ): Promise<TravelEventDto> {
    return this.events.update(id, user, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'deleteTravelEvent' })
  @ApiNoContentResponse()
  remove(@Param('id') id: string, @CurrentUser() user: User): Promise<void> {
    return this.events.softDelete(id, user);
  }
}
