import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { AppScope, NotificationType } from '@prisma/client';
import { PublicUserDto } from '@/modules/users/dto/public-user.dto';

export { NotificationType };

export class NotificationsQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class NotificationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: NotificationType })
  type!: NotificationType;

  @ApiProperty({ enum: AppScope })
  scope!: AppScope;

  @ApiProperty({
    type: PublicUserDto,
    nullable: true,
    description: 'Who caused this, if anyone (system notifications have none)',
  })
  actor!: PublicUserDto | null;

  @ApiProperty({
    nullable: true,
    type: String,
    description:
      'Id of the thing this is about; which table to read it from is implied by `type`',
  })
  subjectId!: string | null;

  @ApiProperty({
    description:
      'Whether the viewer can still act on this (e.g. a connection request that is still pending). False once it becomes history.',
  })
  isActionable!: boolean;

  @ApiProperty({ nullable: true, type: String })
  readAt!: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class PaginatedNotificationsDto {
  @ApiProperty({ type: NotificationDto, isArray: true })
  items!: NotificationDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty({ description: 'Unread count across all pages, for the bell' })
  unreadCount!: number;
}

export class UnreadCountDto {
  @ApiProperty()
  count!: number;
}

export class ClearNotificationsDto {
  @ApiProperty({ description: 'Number of notifications deleted' })
  count!: number;
}
