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
      <header className="space-y-1">
        <h1 className="font-serif text-3xl">{t('queue.title')}</h1>
        <p className="text-muted-foreground">{t('queue.subtitle')}</p>
      </header>
      <QueueList artistId={artistId} onSelect={unlock.open} />
      <QueueFindMine artistId={artistId} />
      <QueueUnlockDialog unlock={unlock} />
    </div>
  );
}
