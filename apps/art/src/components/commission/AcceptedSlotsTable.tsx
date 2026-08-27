'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Input,
  RichTextView,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import type { CommissionDto } from '@hatohui/models';
import { PAYMENT_STATUS_OPTIONS } from '@/constants/commission';
import { ReplaceSlotDialog } from './ReplaceSlotDialog';

function PriceCell({
  quote,
  onSave,
}: {
  quote: number | null;
  onSave: (cents: number | null) => void;
}) {
  const [value, setValue] = useState(
    quote != null ? (quote / 100).toFixed(2) : '',
  );
  return (
    <Input
      className="w-24"
      type="number"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() =>
        onSave(value.trim() ? Math.round(Number(value) * 100) : null)
      }
    />
  );
}

export function AcceptedSlotsTable({
  items,
  candidates,
  onSaveQuote,
  onSavePaymentStatus,
  onConfirm,
  onReplace,
  onSendConfirmation,
  onDelete,
}: {
  items: CommissionDto[];
  candidates: CommissionDto[];
  onSaveQuote: (id: string, quote: number | null) => void;
  onSavePaymentStatus: (
    id: string,
    status: CommissionDto['paymentStatus'],
  ) => void;
  onConfirm: (id: string) => void;
  onReplace: (outgoingId: string, incomingId: string) => void;
  onSendConfirmation: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation('art');
  const [replacing, setReplacing] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">
        {t('commission.admin.accepted.empty')}
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">
                {t('commission.admin.triage.columns.name')}
              </th>
              <th className="px-3 py-2 text-left font-medium">
                {t('commission.admin.triage.columns.contactMethod')}
              </th>
              <th className="px-3 py-2 text-left font-medium">
                {t('commission.admin.triage.columns.deadline')}
              </th>
              <th className="px-3 py-2 text-left font-medium">
                {t('commission.admin.triage.columns.idea')}
              </th>
              <th className="px-3 py-2 text-left font-medium">
                {t('commission.admin.triage.columns.price')}
              </th>
              <th className="px-3 py-2 text-left font-medium">
                {t('commission.admin.detail.paymentStatus')}
              </th>
              <th className="px-3 py-2 text-left font-medium">
                {t('commission.admin.triage.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border align-top">
                <td className="px-3 py-2">{item.clientName}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {t(
                    `commission.preferredContactMethod.${item.preferredContactMethod}`,
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {item.deadline
                    ? new Date(item.deadline).toLocaleDateString()
                    : '—'}
                </td>
                <td className="max-w-64 px-3 py-2">
                  <RichTextView
                    value={item.idea}
                    className="line-clamp-2 text-muted-foreground"
                  />
                </td>
                <td className="px-3 py-2">
                  <PriceCell
                    quote={item.quote}
                    onSave={(cents) => onSaveQuote(item.id, cents)}
                  />
                </td>
                <td className="px-3 py-2">
                  <Select
                    value={item.paymentStatus}
                    onValueChange={(value) =>
                      onSavePaymentStatus(
                        item.id,
                        value as CommissionDto['paymentStatus'],
                      )
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {t(`commission.paymentStatus.${option}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => onConfirm(item.id)}>
                      {t('commission.admin.accepted.confirm')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReplacing(item.id)}
                    >
                      {t('commission.admin.accepted.replace')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSendConfirmation(item.id)}
                    >
                      {t('commission.admin.accepted.sendConfirmation')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(item.id)}
                    >
                      {t('gallery.card.delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReplaceSlotDialog
        open={replacing !== null}
        onOpenChange={(open) => !open && setReplacing(null)}
        candidates={candidates}
        onPick={(incomingId) => {
          if (replacing) onReplace(replacing, incomingId);
        }}
      />
    </>
  );
}
