import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
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
import {
  CreateTravelCustomHolidayDto,
  CreateTravelScheduleExceptionDto,
  TravelCountrySettingDto,
  TravelCustomHolidayDto,
  TravelDateRangeQueryDto,
  TravelHeatmapEntryDto,
  TravelPublicHolidayDto,
  TravelScheduleExceptionDto,
  TravelWorkScheduleDto,
  UpdateTravelCountrySettingDto,
  UpsertTravelWorkScheduleDto,
} from '@/modules/travel-schedule/dto/travel-schedule.dto';
import { TravelHolidaysService } from '@/modules/travel-schedule/services/travel-holidays.service';
import { TravelScheduleService } from '@/modules/travel-schedule/services/travel-schedule.service';

@ApiTags('travel')
@Controller('travel')
@UseGuards(AuthGuard)
export class TravelScheduleController {
  constructor(
    private readonly schedule: TravelScheduleService,
    private readonly holidays: TravelHolidaysService,
  ) {}

  @Get('work-schedule')
  @ApiOperation({ operationId: 'travelWorkSchedule' })
  @ApiOkResponse({ type: TravelWorkScheduleDto })
  getWorkSchedule(@CurrentUser() user: User): Promise<TravelWorkScheduleDto> {
    return this.schedule.getWorkSchedule(user.id);
  }

  @Put('work-schedule')
  @ApiOperation({ operationId: 'upsertTravelWorkSchedule' })
  @ApiOkResponse({ type: TravelWorkScheduleDto })
  upsertWorkSchedule(
    @CurrentUser() user: User,
    @Body() dto: UpsertTravelWorkScheduleDto,
  ): Promise<TravelWorkScheduleDto> {
    return this.schedule.upsertWorkSchedule(user.id, dto);
  }

  @Get('schedule-exceptions')
  @ApiOperation({ operationId: 'travelScheduleExceptions' })
  @ApiOkResponse({ type: TravelScheduleExceptionDto, isArray: true })
  listExceptions(
    @CurrentUser() user: User,
  ): Promise<TravelScheduleExceptionDto[]> {
    return this.schedule.listExceptions(user.id);
  }

  @Post('schedule-exceptions')
  @HttpCode(200)
  @ApiOperation({ operationId: 'createTravelScheduleException' })
  @ApiOkResponse({ type: TravelScheduleExceptionDto })
  createException(
    @CurrentUser() user: User,
    @Body() dto: CreateTravelScheduleExceptionDto,
  ): Promise<TravelScheduleExceptionDto> {
    return this.schedule.upsertException(user.id, dto);
  }

  @Delete('schedule-exceptions/:id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteTravelScheduleException' })
  @ApiNoContentResponse()
  deleteException(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<void> {
    return this.schedule.deleteException(user.id, id);
  }

  @Get('custom-holidays')
  @ApiOperation({ operationId: 'travelCustomHolidays' })
  @ApiOkResponse({ type: TravelCustomHolidayDto, isArray: true })
  listCustomHolidays(
    @CurrentUser() user: User,
  ): Promise<TravelCustomHolidayDto[]> {
    return this.schedule.listCustomHolidays(user.id);
  }

  @Post('custom-holidays')
  @HttpCode(200)
  @ApiOperation({ operationId: 'createTravelCustomHoliday' })
  @ApiOkResponse({ type: TravelCustomHolidayDto })
  createCustomHoliday(
    @CurrentUser() user: User,
    @Body() dto: CreateTravelCustomHolidayDto,
  ): Promise<TravelCustomHolidayDto> {
    return this.schedule.upsertCustomHoliday(user.id, dto);
  }

  @Delete('custom-holidays/:id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteTravelCustomHoliday' })
  @ApiNoContentResponse()
  deleteCustomHoliday(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<void> {
    return this.schedule.deleteCustomHoliday(user.id, id);
  }

  @Get('holidays')
  @ApiOperation({ operationId: 'travelHolidays' })
  @ApiOkResponse({ type: TravelPublicHolidayDto, isArray: true })
  getPublicHolidays(
    @CurrentUser() user: User,
    @Query() query: TravelDateRangeQueryDto,
  ): Promise<TravelPublicHolidayDto[]> {
    return this.schedule.getPublicHolidaysInRange(
      user.id,
      query.from,
      query.to,
    );
  }

  @Get('holiday-country')
  @ApiOperation({ operationId: 'travelHolidayCountry' })
  @ApiOkResponse({ type: TravelCountrySettingDto })
  async getHolidayCountry(
    @CurrentUser() user: User,
  ): Promise<TravelCountrySettingDto> {
    return { country: await this.holidays.getUserCountry(user.id) };
  }

  @Put('holiday-country')
  @ApiOperation({ operationId: 'updateTravelHolidayCountry' })
  @ApiOkResponse({ type: TravelCountrySettingDto })
  async updateHolidayCountry(
    @CurrentUser() user: User,
    @Body() dto: UpdateTravelCountrySettingDto,
  ): Promise<TravelCountrySettingDto> {
    return {
      country: await this.holidays.setUserCountry(user.id, dto.country),
    };
  }

  @Get('heatmap')
  @ApiOperation({ operationId: 'travelHeatmap' })
  @ApiOkResponse({ type: TravelHeatmapEntryDto, isArray: true })
  getHeatmap(
    @CurrentUser() user: User,
    @Query() query: TravelDateRangeQueryDto,
  ): Promise<TravelHeatmapEntryDto[]> {
    return this.schedule.getHeatmap(user.id, query.from, query.to);
  }
}
