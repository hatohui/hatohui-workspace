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
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import {
  ClearNotificationsDto,
  NotificationsQueryDto,
  PaginatedNotificationsDto,
  UnreadCountDto,
} from '@/modules/notifications/dto/notification.dto';
import type { User } from '@prisma/client';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({
    operationId: 'notifications',
    summary: "The current account's notification inbox, newest first",
  })
  @ApiOkResponse({ type: PaginatedNotificationsDto })
  list(
    @Query() query: NotificationsQueryDto,
    @CurrentUser() viewer: User,
  ): Promise<PaginatedNotificationsDto> {
    return this.notifications.list(
      viewer,
      query.page ?? 1,
      query.pageSize ?? 20,
    );
  }

  @Get('unread-count')
  @ApiOperation({
    operationId: 'unreadNotificationCount',
    summary: 'Unread notification count, for the bell badge',
  })
  @ApiOkResponse({ type: UnreadCountDto })
  unreadCount(@CurrentUser() viewer: User): Promise<UnreadCountDto> {
    return this.notifications.unreadCount(viewer);
  }

  @Post(':id/read')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'markNotificationRead',
    summary: 'Mark a single notification read',
  })
  markRead(
    @Param('id') id: string,
    @CurrentUser() viewer: User,
  ): Promise<void> {
    return this.notifications.markRead(id, viewer);
  }

  @Post('read-all')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'markAllNotificationsRead',
    summary: 'Mark every unread notification read',
  })
  markAllRead(@CurrentUser() viewer: User): Promise<void> {
    return this.notifications.markAllRead(viewer);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteNotification',
    summary:
      'Delete a settled notification. Rejects a still-pending, still-actionable connection request.',
  })
  delete(@Param('id') id: string, @CurrentUser() viewer: User): Promise<void> {
    return this.notifications.delete(id, viewer);
  }

  @Delete()
  @HttpCode(200)
  @ApiOperation({
    operationId: 'clearNotifications',
    summary:
      'Delete every settled notification (read history, accepted/rejected). Pending connection requests are kept.',
  })
  @ApiOkResponse({ type: ClearNotificationsDto })
  clear(@CurrentUser() viewer: User): Promise<ClearNotificationsDto> {
    return this.notifications.clear(viewer);
  }
}
