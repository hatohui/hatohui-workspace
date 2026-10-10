'use client';

import { useTranslation } from '@hatohui/i18n';
import { useArtistCommissionOpening } from './useArtistCommissionOpening';
import { useCommissionFormatters } from './useCommissionFormatters';

export function useLandingCommissionStatus(artistId: string) {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();
  const { opening, isOpen, isLoading } = useArtistCommissionOpening(artistId);

  const label = isOpen
    ? t('landing.status.open')
    : opening?.status === 'SCHEDULED' && opening.scheduledAt
      ? t('landing.status.scheduled', {
          date: format.date(opening.scheduledAt),
        })
      : t('landing.status.closed');

  return { label, isOpen, isLoading };
}
