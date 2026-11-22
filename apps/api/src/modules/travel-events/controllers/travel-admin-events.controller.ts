import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
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
import { TravelEditorGuard } from '@/modules/travel-access/guards/travel-editor.guard';
import {
  TravelAdminEventQueryDto,
  TravelEventDto,
} from '@/modules/travel-events/dto/travel-event.dto';
import { TravelEventsService } from '@/modules/travel-events/services/travel-events.service';

@ApiTags('travel')
@Controller('travel/admin/events')
@UseGuards(TravelEditorGuard)
export class TravelAdminEventsController {
  constructor(private readonly events: TravelEventsService) {}

  @Get()
  @ApiOperation({ operationId: 'adminTravelEvents' })
  @ApiOkResponse({ type: TravelEventDto, isArray: true })
  list(@Query() query: TravelAdminEventQueryDto): Promise<TravelEventDto[]> {
    return this.events.listAdmin(query);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @ApiOperation({ operationId: 'approveTravelEvent' })
  @ApiOkResponse({ type: TravelEventDto })
  approve(@Param('id') id: string): Promise<TravelEventDto> {
    return this.events.approve(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'hardDeleteTravelEvent' })
  @ApiNoContentResponse()
  hardDelete(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.events.hardDelete(id, user.id);
  }
}
