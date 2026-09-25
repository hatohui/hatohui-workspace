'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
} from '@hatohui/ui';
import { useClientPanel } from '@/hooks/useClientPanel';
import { ClientAccountCard } from './ClientAccountCard';
import { ClientCommissionList } from './ClientCommissionList';

export function ClientPanel({
  clientId,
  onClose,
}: {
  clientId: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation('art');
  const { client } = useClientPanel(clientId);

  return (
    <Sheet open={clientId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent closeLabel={t('app.requests.panel.close')}>
        <SheetHeader>
          <SheetTitle>{client?.name ?? t('app.clients.title')}</SheetTitle>
          <SheetDescription>{client?.email ?? ''}</SheetDescription>
        </SheetHeader>

        {client ? (
          <SheetBody>
            <ClientAccountCard account={client.account} />
            <section className="space-y-1">
              <h3 className="text-sm font-medium">
                {t('app.clients.contact')}
              </h3>
              <p className="text-sm text-muted-foreground">{client.contact}</p>
            </section>
            <ClientCommissionList commissions={client.commissions} />
          </SheetBody>
        ) : (
          <div className="space-y-4 p-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
