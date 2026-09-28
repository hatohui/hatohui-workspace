'use client';

import { useTranslation } from '@hatohui/i18n';
import type { AssetDto } from '@hatohui/models';
import { Switch } from '@hatohui/ui';
import { useArtworkPrivacy } from '@/hooks/useArtworkPrivacy';

export function ArtworkPrivacyToggle({ asset }: { asset: AssetDto }) {
  const { t } = useTranslation('art');
  const privacy = useArtworkPrivacy(asset);

  return (
    <div className="space-y-1 rounded-xl border border-border p-4">
      <label className="flex items-center gap-3 text-sm">
        <Switch
          checked={privacy.isPrivate}
          disabled={privacy.isUpdating}
          onCheckedChange={(checked) => void privacy.setPrivate(checked)}
        />
        {t('gallery.detail.privateToggle')}
      </label>
      {privacy.isPrivateViaProject && (
        <p className="pl-12 text-xs text-muted-foreground">
          {t('gallery.detail.privateViaProject')}
        </p>
      )}
    </div>
  );
}
