'use client';

import { useTranslation } from '@hatohui/i18n';
import { useArtistCommissionOpening } from '@/hooks/useArtistCommissionOpening';
import { CommissionForm } from './CommissionForm';
import { CommissionClosedNotice } from './CommissionClosedNotice';

export function CommissionIntake({
  artistId,
  artistName,
}: {
  artistId: string;
  artistName: string;
}) {
  const { t } = useTranslation('art');
  const { opening, isOpen, isLoading } = useArtistCommissionOpening(artistId);

  if (isLoading) {
    return (
      <p className="mx-auto max-w-xl text-muted-foreground">
        {t('common:loading')}
      </p>
    );
  }

  if (isOpen) {
    return <CommissionForm artistId={artistId} />;
  }

  return (
    <div className="mx-auto max-w-xl">
      <CommissionClosedNotice opening={opening} artistName={artistName} />
    </div>
  );
}
