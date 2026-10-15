import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import {
  BirthdaysByMonthDto,
  MonthQueryDto,
} from '@/modules/birthdays/dto/by-month.dto';
import {
  PaginatedUpcomingSectionsDto,
  UpcomingSectionsQueryDto,
} from '@/modules/birthdays/dto/upcoming.dto';
import { BirthdaysService } from '@/modules/birthdays/services/birthdays.service';
import type { User } from '@prisma/client';

@ApiTags('friends')
@Controller('friends')
export class BirthdaysController {
  constructor(private readonly birthdays: BirthdaysService) {}

  @Get('upcoming/sections')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'upcomingFriendSections',
    summary:
      "Paginated, grouped upcoming birthdays for the timeline's infinite scroll",
  })
  @ApiOkResponse({ type: PaginatedUpcomingSectionsDto })
  findUpcomingSections(
    @Query() query: UpcomingSectionsQueryDto,
    @CurrentUser() viewer: User,
  ): Promise<PaginatedUpcomingSectionsDto> {
    return this.birthdays.findUpcomingSections(
      query.query,
      query.group ?? 'month',
      query.direction ?? 'asc',
      query.page ?? 1,
      query.pageSize ?? 30,
      viewer,
    );
  }

  @Get('birthdays-by-month')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'birthdaysByMonth',
    summary: 'Friends whose birthday falls in a given calendar month',
  })
  @ApiOkResponse({ type: BirthdaysByMonthDto })
  findBirthdaysByMonth(
    @Query() query: MonthQueryDto,
    @CurrentUser() viewer: User,
  ): Promise<BirthdaysByMonthDto> {
    return this.birthdays.findBirthdaysByMonth(
      query.month,
      query.query,
      viewer,
    );
  }
}
