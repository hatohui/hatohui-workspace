import { Injectable } from '@nestjs/common';
import { Prisma, type User } from '@prisma/client';
import { Database } from '@/infra/db';
import { Cache, CACHE_KEYS } from '@/infra/cache';
import { BirthdaysByMonthDto } from '@/modules/birthdays/dto/by-month.dto';
import {
  PaginatedUpcomingSectionsDto,
  UpcomingSectionDto,
} from '@/modules/birthdays/dto/upcoming.dto';
import {
  BIRTHDAYS_CACHE_TTL_SECONDS,
  type SortDirection,
  type UpcomingGroupOption,
} from '@/modules/birthdays/birthdays.constants';
import { canViewBirthday } from '@/modules/profiles/utils/birthday-visibility';
import {
  groupUpcomingFriends,
  matchesFriendSearch,
  matchesUpcomingSearch,
  toUpcomingFriendDto,
  type UpcomingComputedFriend,
} from '@/modules/birthdays/utils/birthday-grouping';
import { toFriendDto } from '@/modules/profiles/utils/profile.mapper';
import {
  ViewerContextService,
  type ViewerContext,
} from '@/modules/viewer-context/services/viewer-context.service';

const WITH_PROFILE = { profile: { include: { birthday: true } } } as const;
type BirthdayWithProfile = Prisma.BirthdayGetPayload<{
  include: typeof WITH_PROFILE;
}>;

@Injectable()
export class BirthdaysService {
  constructor(
    private readonly db: Database,
    private readonly cache: Cache,
    private readonly viewerContext: ViewerContextService,
  ) {}

  /// Unfiltered and shared across every viewer — visibility is applied
  /// afterwards via `canViewBirthday`, the in-memory mirror of the same
  /// rule `birthdayVisibilityWhere` used to apply in SQL. Invalidated
  /// explicitly wherever a birthday is created or onboarding finishes.
  private allBirthdays(): Promise<BirthdayWithProfile[]> {
    return this.cache.getOrSet(
      CACHE_KEYS.birthdaysList(),
      BIRTHDAYS_CACHE_TTL_SECONDS,
      () => this.db.birthday.findMany({ include: WITH_PROFILE }),
    );
  }

  async findUpcomingSections(
    query: string | undefined,
    group: UpcomingGroupOption,
    direction: SortDirection,
    page: number,
    pageSize: number,
    viewer: User | null,
  ): Promise<PaginatedUpcomingSectionsDto> {
    const ctx = await this.viewerContext.for(viewer);
    const computed = await this.computeUpcoming(ctx);
    const matching = computed.filter((friend) =>
      matchesUpcomingSearch(friend, query),
    );

    const orderedSections = groupUpcomingFriends(matching, group, direction);
    const flattened = orderedSections.flatMap((section) =>
      section.friends.map((friend) => ({ key: section.key, friend })),
    );

    const start = (page - 1) * pageSize;
    const pageItems = flattened.slice(start, start + pageSize);

    const sections: UpcomingSectionDto[] = [];
    for (const item of pageItems) {
      const friend = toUpcomingFriendDto(item.friend);
      const existing = sections.at(-1);
      if (existing && existing.key === item.key) {
        existing.friends.push(friend);
      } else {
        sections.push({ key: item.key, friends: [friend] });
      }
    }

    return {
      sections,
      page,
      pageSize,
      hasMore: start + pageItems.length < flattened.length,
    };
  }

  async findBirthdaysByMonth(
    month: number,
    query: string | undefined,
    viewer: User | null,
  ): Promise<BirthdaysByMonthDto> {
    const ctx = await this.viewerContext.for(viewer);
    const all = await this.allBirthdays();
    const birthdays = all
      .filter(
        (birthday) =>
          birthday.month === month && canViewBirthday(birthday.profile, ctx),
      )
      .sort((a, b) => a.day - b.day);

    return {
      friends: birthdays
        .map((birthday) => toFriendDto(birthday.profile, ctx))
        .filter((friend) => matchesFriendSearch(friend, query)),
    };
  }

  private async computeUpcoming(
    ctx: ViewerContext,
  ): Promise<UpcomingComputedFriend[]> {
    const all = await this.allBirthdays();
    const birthdays = all.filter((birthday) =>
      canViewBirthday(birthday.profile, ctx),
    );

    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    return birthdays
      .map((birthday) => {
        const { month, day } = birthday;
        const isBeforeToday =
          month < todayMonth || (month === todayMonth && day < todayDay);
        const anchorYear = today.getFullYear() + (isBeforeToday ? 1 : 0);
        const nextBirthdayDate = new Date(Date.UTC(anchorYear, month - 1, day));

        return {
          ...toFriendDto(birthday.profile, ctx),
          turningAge: birthday.year ? anchorYear - birthday.year : null,
          nextBirthdayDate: nextBirthdayDate.toISOString().slice(0, 10),
          sortKey: nextBirthdayDate.getTime(),
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey);
  }
}
