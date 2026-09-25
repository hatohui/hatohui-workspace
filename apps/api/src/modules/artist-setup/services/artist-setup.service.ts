import { Injectable } from '@nestjs/common';
import { Database } from '@/infra/db';
import { USER_SETTING_TYPES } from '@/modules/user-settings/user-settings.constants';
import { UserSettingsService } from '@/modules/user-settings/services/user-settings.service';
import { CommissionPricingService } from '@/modules/commission-pricing/services/commission-pricing.service';
import { CommissionTypesService } from '@/modules/commission-types/services/commission-types.service';
import { ArtistSetupDto } from '@/modules/artist-setup/dto/artist-setup.dto';
import {
  ARTIST_SETUP_STEPS,
  type ArtistSetupStep,
} from '@/modules/artist-setup/artist-setup.constants';

const DISMISSED = USER_SETTING_TYPES.artistSetupDismissed;

@Injectable()
export class ArtistSetupService {
  constructor(
    private readonly db: Database,
    private readonly userSettings: UserSettingsService,
    private readonly pricing: CommissionPricingService,
    private readonly types: CommissionTypesService,
  ) {}

  async get(artistId: string): Promise<ArtistSetupDto> {
    const [settings, types, assetCount, openingCount, dismissed] =
      await Promise.all([
        this.pricing.getSettings(artistId),
        this.types.listForArtist(artistId),
        this.db.asset.count({ where: { uploadedById: artistId } }),
        this.db.commissionOpening.count({ where: { artistId } }),
        this.userSettings.get(artistId, DISMISSED.scope, DISMISSED.type),
      ]);

    const done: Record<ArtistSetupStep, boolean> = {
      payment: settings.paymentMethods.length > 0,
      pricing: types.some((type) => type.enabled && type.startingPrice != null),
      examples: assetCount > 0,
      opening: openingCount > 0,
    };
    const steps = ARTIST_SETUP_STEPS.map((key) => ({ key, done: done[key] }));
    const nextStep = steps.find((step) => !step.done)?.key ?? null;
    const isDismissed = dismissed === 'true';

    return {
      steps,
      nextStep,
      dismissed: isDismissed,
      shouldShow: nextStep !== null && !isDismissed,
    };
  }

  async dismiss(artistId: string): Promise<ArtistSetupDto> {
    await this.userSettings.set(
      artistId,
      DISMISSED.scope,
      DISMISSED.type,
      'true',
    );
    return this.get(artistId);
  }
}
