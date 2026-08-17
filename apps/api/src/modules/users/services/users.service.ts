import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Database } from '@/infra/db';
import {
  composeLeadDays,
  decomposeLeadDays,
  resolveLeadDays,
  serializeLeadDays,
  serializeRemindersEnabled,
} from '@/common/utils/birthday-reminders';
import { BirthdayConfigService } from '@/modules/cron/services/birthday-config.service';
import { USER_SETTING_TYPES } from '@/modules/user-settings/user-settings.constants';
import { UserSettingsService } from '@/modules/user-settings/services/user-settings.service';
import { Prisma, type User } from '@prisma/client';
import { PaginatedUsersDto, UpdateMeDto } from '@/modules/users/dto/user.dto';
import {
  PUBLIC_USER_SELECT,
  toPublicUserDto,
} from '@/modules/users/dto/public-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly db: Database,
    private readonly userSettings: UserSettingsService,
    private readonly birthdayConfig: BirthdayConfigService,
  ) {}

  async search(
    query: string | undefined,
    page: number,
    pageSize: number,
    viewer: User,
  ): Promise<PaginatedUsersDto> {
    const needle = query?.trim();
    const where: Prisma.UserWhereInput = {
      id: { not: viewer.id },
      profile: { isNot: null },
      ...(needle
        ? {
            OR: [
              { name: { contains: needle, mode: 'insensitive' as const } },
              {
                profile: {
                  displayName: {
                    contains: needle,
                    mode: 'insensitive' as const,
                  },
                },
              },
              {
                profile: {
                  handle: { contains: needle, mode: 'insensitive' as const },
                },
              },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        orderBy: { profile: { displayName: 'asc' } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: PUBLIC_USER_SELECT,
      }),
      this.db.user.count({ where }),
    ]);

    return { items: users.map(toPublicUserDto), total, page, pageSize };
  }

  async updateMe(dto: UpdateMeDto, viewer: User): Promise<User> {
    if (dto.handle !== undefined || dto.displayName !== undefined) {
      await this.db.profile
        .update({
          where: { userId: viewer.id },
          data: { handle: dto.handle, displayName: dto.displayName },
        })
        .catch((error) => {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
              throw new ConflictException('That handle is already taken');
            }
            if (error.code === 'P2025') {
              throw new BadRequestException(
                'Join the directory before setting a handle or display name',
              );
            }
          }
          throw error;
        });
    }

    if (dto.birthdayReminderLeadDays !== undefined) {
      const setting = USER_SETTING_TYPES.birthdayReminderLeadDays;
      await this.userSettings.set(
        viewer.id,
        setting.scope,
        setting.type,
        serializeLeadDays(dto.birthdayReminderLeadDays),
      );
    }

    if (
      dto.birthdayReminderDaysBefore !== undefined ||
      dto.birthdayReminderWeeksBefore !== undefined
    ) {
      await this.setReminderOffsets(viewer, dto);
    }

    if (dto.birthdayRemindersEnabled !== undefined) {
      const enabledSetting = USER_SETTING_TYPES.birthdayRemindersEnabled;
      await this.userSettings.set(
        viewer.id,
        enabledSetting.scope,
        enabledSetting.type,
        serializeRemindersEnabled(dto.birthdayRemindersEnabled),
      );
    }

    if (dto.timezone === undefined) return viewer;

    return this.db.user.update({
      where: { id: viewer.id },
      data: { timezone: dto.timezone },
    });
  }

  /// The two offsets share one stored lead-days list, so a request that sets
  /// only one of them has to keep the other's current value.
  private async setReminderOffsets(
    viewer: User,
    dto: UpdateMeDto,
  ): Promise<void> {
    const setting = USER_SETTING_TYPES.birthdayReminderLeadDays;
    const [stored, birthdayConfig] = await Promise.all([
      this.userSettings.get(viewer.id, setting.scope, setting.type),
      this.birthdayConfig.load(),
    ]);
    const current = decomposeLeadDays(
      resolveLeadDays(stored, birthdayConfig.reminderDays),
    );

    await this.userSettings.set(
      viewer.id,
      setting.scope,
      setting.type,
      serializeLeadDays(
        composeLeadDays({
          daysBefore: dto.birthdayReminderDaysBefore ?? current.daysBefore,
          weeksBefore: dto.birthdayReminderWeeksBefore ?? current.weeksBefore,
        }),
      ),
    );
  }
}
