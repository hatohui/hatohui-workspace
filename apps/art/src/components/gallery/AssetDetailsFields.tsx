'use client';

import { useTranslation } from '@hatohui/i18n';
import { Input, Label, Textarea } from '@hatohui/ui';
import {
  ASSET_DESCRIPTION_MAX_LENGTH,
  ASSET_TITLE_MAX_LENGTH,
} from '@/constants/gallery';
import type { AssetDetails } from '@/hooks/useUploadQueue';

export function AssetDetailsFields({
  idPrefix,
  details,
  onChange,
}: {
  idPrefix: string;
  details: AssetDetails;
  onChange: (details: AssetDetails) => void;
}) {
  const { t } = useTranslation('art');
  const titleId = `${idPrefix}-title`;
  const descriptionId = `${idPrefix}-description`;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={titleId}>{t('gallery.details.titleLabel')}</Label>
        <Input
          id={titleId}
          maxLength={ASSET_TITLE_MAX_LENGTH}
          placeholder={t('gallery.details.titlePlaceholder')}
          value={details.title}
          onChange={(event) =>
            onChange({ ...details, title: event.target.value })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={descriptionId}>
          {t('gallery.details.descriptionLabel')}
        </Label>
        <Textarea
          id={descriptionId}
          rows={4}
          maxLength={ASSET_DESCRIPTION_MAX_LENGTH}
          placeholder={t('gallery.details.descriptionPlaceholder')}
          value={details.description}
          onChange={(event) =>
            onChange({ ...details, description: event.target.value })
          }
        />
      </div>
    </div>
  );
}
