import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { Database } from '@/libs/db';
import { Cache, CACHE_KEYS } from '@/libs/cache';
import {
  decomposeLeadDays,
  resolveLeadDays,
  resolveRemindersEnabled,
} from '@/libs/birthday-reminders';
import { UserDto } from '@/modules/auth/dto/auth.dto';
import { BirthdayConfigService } from '@/modules/cron/birthday-config';
import { USER_SETTING_TYPES } from '@/modules/user-settings/user-settings.constants';
import { UserSettingsService } from '@/modules/user-settings/user-settings.service';
import type { Env } from '@/config/env';
import { AppScope, type User } from '@prisma/client';

const ADMIN_EMAIL_CONFIG_TYPE = 'admin.email';
const ADMIN_EMAIL_TTL_SECONDS = 300;

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

  /// Derived per request instead of cached on the row, so it can't drift from
  /// the config the way the old `User.role` column did.
  async isAdmin(user: User | null): Promise<boolean> {
    if (!user) return false;
    const email = await this.adminEmail();
    return email !== null && email === user.email.toLowerCase();
  }

  /// Everything displayable comes from the profile, resolved here so callers
  /// never touch the raw Google values.
  async toUserDto(user: User): Promise<UserDto> {
    const setting = USER_SETTING_TYPES.birthdayReminderLeadDays;
    const enabledSetting = USER_SETTING_TYPES.birthdayRemindersEnabled;
    const [profile, storedLeadDays, storedEnabled, birthdayConfig] =
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
      isAdmin: await this.isAdmin(user),
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

  private adminEmail(): Promise<string | null> {
    return this.cache.getOrSet(
      CACHE_KEYS.adminEmail(),
      ADMIN_EMAIL_TTL_SECONDS,
      async () => {
        const config = await this.db.appConfig.findUnique({
          where: {
            type_scope: { type: ADMIN_EMAIL_CONFIG_TYPE, scope: AppScope.ALL },
          },
          select: { value: true },
        });
        return config?.value ? config.value.toLowerCase() : null;
      },
    );
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
