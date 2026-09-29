'use client';

import { useTranslation } from '@hatohui/i18n';
import { useQueueUnlock } from '@/hooks/useQueueUnlock';
import { QueueList } from './QueueList';
import { QueueFindMine } from './QueueFindMine';
import { QueueUnlockDialog } from './QueueUnlockDialog';

export function QueuePageContent({ artistId }: { artistId: string }) {
  const { t } = useTranslation('art');
  const unlock = useQueueUnlock();

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h1 className="font-serif text-3xl">{t('queue.title')}</h1>
        <QueueList artistId={artistId} onSelect={unlock.openQueueItem} />
      </div>
      <QueueFindMine artistId={artistId} onLocked={unlock.openMatch} />
      <QueueUnlockDialog unlock={unlock} />
    </div>
  );
}
