'use client';

import Link from 'next/link';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SheetFooter,
} from '@hatohui/ui';
import { ExternalLink } from 'lucide-react';
import type { CommissionDto } from '@hatohui/models';
import { COMMISSION_STATUS_OPTIONS } from '@/constants/commission';

type Status = CommissionDto['status'];

export function CommissionRequestPanelFooter({
  status,
  fullPageHref,
  onQuote,
  onAccept,
  onDecline,
  onStatusChange,
}: {
  status: Status;
  fullPageHref: string | null;
  onQuote: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onStatusChange: (status: Status) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <SheetFooter>
      {status === 'PENDING' ? (
        <>
          <Button onClick={onAccept}>
            {t('commission.admin.triage.accept')}
          </Button>
          <Button variant="outline" onClick={onQuote}>
            {t('app.quotes.sendQuote')}
          </Button>
          <Button variant="ghost" onClick={onDecline}>
            {t('commission.admin.triage.decline')}
          </Button>
        </>
      ) : (
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as Status)}
        >
          <SelectTrigger
            className="w-48"
            aria-label={t('app.requests.panel.status')}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMMISSION_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {t(`commission.status.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {fullPageHref && (
        <Button variant="ghost" asChild className="ml-auto">
          <Link href={fullPageHref}>
            <ExternalLink className="size-4" aria-hidden />
            {t('app.requests.panel.openFullPage')}
          </Link>
        </Button>
      )}
    </SheetFooter>
  );
}
