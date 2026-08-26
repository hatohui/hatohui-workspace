import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { Database } from '@/infra/db';
import { Cache, CACHE_KEYS } from '@/infra/cache';
import {
  decomposeLeadDays,
  resolveLeadDays,
  resolveRemindersEnabled,
} from '@/common/utils/birthday-reminders';
import { UserDto } from '@/modules/auth/dto/auth.dto';
import { BirthdayConfigService } from '@/modules/cron/services/birthday-config.service';
import { USER_SETTING_TYPES } from '@/modules/user-settings/user-settings.constants';
import { UserSettingsService } from '@/modules/user-settings/services/user-settings.service';
import type { Env } from '@/config/env';
import type { User } from '@prisma/client';
import {
  ROLE_CACHE_TTL_SECONDS,
  ROLE_KEYS,
  type RoleKey,
} from '@/modules/auth/auth.constants';

@Injectable()
export class AuthService {
  private readonly client: OAuth2Client;

  constructor(
    private readonly db: Database,
    private readonly config: ConfigService<Env, true>,
    private readonly cache: Cache,
    private readonly userSettings: UserSettingsService,
    private readonly birthdayConfig: BirthdayConfigService,
  ) {
    this.client = new OAuth2Client(
      this.config.get('GOOGLE_OAUTH_CLIENT_ID', { infer: true }),
      this.config.get('GOOGLE_OAUTH_CLIENT_SECRET', { infer: true }),
    );
  }

  async isAdmin(user: User | null): Promise<boolean> {
    return this.hasRole(user, ROLE_KEYS.admin);
  }

  async isArtist(user: User | null): Promise<boolean> {
    return this.hasRole(user, ROLE_KEYS.artist);
  }

  async hasRole(user: User | null, roleKey: RoleKey): Promise<boolean> {
    if (!user) return false;
    const roles = await this.rolesFor(user.id);
    return roles.includes(roleKey);
  }

  private rolesFor(userId: string): Promise<RoleKey[]> {
    return this.cache.getOrSet(
      CACHE_KEYS.userRoles(userId),
      ROLE_CACHE_TTL_SECONDS,
      async () => {
        const rows = await this.db.userRole.findMany({
          where: { userId },
          select: { role: { select: { key: true } } },
        });
        return rows.map((row) => row.role.key as RoleKey);
      },
    );
  }

  /// Everything displayable comes from the profile, resolved here so callers
  /// never touch the raw Google values.
  async toUserDto(user: User): Promise<UserDto> {
    const setting = USER_SETTING_TYPES.birthdayReminderLeadDays;
    const enabledSetting = USER_SETTING_TYPES.birthdayRemindersEnabled;
    const [profile, storedLeadDays, storedEnabled, birthdayConfig, roles] =
      await Promise.all([
        this.db.profile.findUnique({
          where: { userId: user.id },
          select: { displayName: true, handle: true, avatarUrl: true },
        }),
        this.userSettings.get(user.id, setting.scope, setting.type),
        this.userSettings.get(
          user.id,
          enabledSetting.scope,
          enabledSetting.type,
        ),
        this.birthdayConfig.load(),
        this.rolesFor(user.id),
      ]);

    const leadDays = resolveLeadDays(
      storedLeadDays,
      birthdayConfig.reminderDays,
    );
    const offsets = decomposeLeadDays(leadDays);

    return {
      id: user.id,
      name: profile?.displayName ?? user.name,
      handle: profile?.handle ?? null,
      avatarUrl: profile?.avatarUrl ?? user.avatarUrl,
      isAdmin: roles.includes(ROLE_KEYS.admin),
      isArtist: roles.includes(ROLE_KEYS.artist),
      onboardingStatus: user.onboardingStatus,
      timezone: user.timezone,
      birthdayReminderLeadDays: leadDays,
      birthdayRemindersEnabled: resolveRemindersEnabled(
        storedEnabled,
        leadDays,
      ),
      birthdayReminderDaysBefore: offsets.daysBefore,
      birthdayReminderWeeksBefore: offsets.weeksBefore,
    };
  }

  async loginWithGoogle(code: string): Promise<User> {
    const exchange = await this.client
      .getToken({ code, redirect_uri: 'postmessage' })
      .catch(() => null);

    const idToken = exchange?.tokens.id_token;
    if (!idToken) {
      throw new UnauthorizedException('Invalid Google authorization code');
    }

    const ticket = await this.client
      .verifyIdToken({
        idToken,
        audience: this.config.get('GOOGLE_OAUTH_CLIENT_ID', { infer: true }),
      })
      .catch(() => null);

    const payload = ticket?.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    return this.db.user.upsert({
      where: { googleId: payload.sub },
      create: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email,
        avatarUrl: payload.picture ?? null,
      },
      update: {
        email: payload.email,
        name: payload.name ?? payload.email,
        avatarUrl: payload.picture ?? null,
      },
    });
  }
}
