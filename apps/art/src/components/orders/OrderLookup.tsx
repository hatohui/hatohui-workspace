'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import { useCommissionEmailLookup } from '@/hooks/useCommissionLookup';
import { OrderLookupResults } from './OrderLookupResults';

export function OrderLookup() {
  const { t } = useTranslation('art');
  const router = useRouter();
  const lookup = useCommissionEmailLookup();
  const [code, setCode] = useState('');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium">{t('queue.accessMineTitle')}</h2>
        <div className="mt-4 flex gap-2">
          <Input
            type="email"
            placeholder={t('orders.emailPlaceholder')}
            value={lookup.email}
            onChange={(event) => lookup.setEmail(event.target.value)}
          />
          <Button onClick={lookup.search}>{t('orders.search')}</Button>
        </div>
      </div>

      {lookup.hasSearched && (
        <OrderLookupResults items={lookup.items} isLoading={lookup.isLoading} />
      )}

      <div className="border-t border-border pt-6">
        <Label htmlFor="code">{t('orders.codeLabel')}</Label>
        <div className="mt-1 flex gap-2">
          <Input
            id="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <Button
            variant="outline"
            disabled={!code}
            onClick={() => router.push(`/queue/${code}`)}
          >
            {t('orders.codeGo')}
          </Button>
        </div>
      </div>
    </div>
  );
}
