'use client';

import { useTranslation } from '@hatohui/i18n';
import { useArtistCommissionOpening } from '@/hooks/useArtistCommissionOpening';
import { CommissionForm } from './CommissionForm';
import { CommissionClosedNotice } from './CommissionClosedNotice';

export function CommissionIntake({
  artistId,
  artistName,
  artistHandle,
}: {
  artistId: string;
  artistName: string;
  artistHandle: string;
}) {
  const { t } = useTranslation('art');
  const { opening, isOpen, isLoading } = useArtistCommissionOpening(artistId);

  if (isLoading) {
    return <p className="text-muted-foreground">{t('common:loading')}</p>;
  }

  if (isOpen) {
    return <CommissionForm artistId={artistId} />;
  }

  return (
    <CommissionClosedNotice
      opening={opening}
      artistName={artistName}
      artistHandle={artistHandle}
    />
  );
}
