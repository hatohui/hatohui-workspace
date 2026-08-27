'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@hatohui/ui';
import type { CommissionDto } from '@hatohui/models';

export function ReplaceSlotDialog({
  open,
  onOpenChange,
  candidates,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: CommissionDto[];
  onPick: (id: string) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('commission.admin.accepted.replaceTitle')}
          </DialogTitle>
        </DialogHeader>
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('commission.admin.accepted.replaceEmpty')}
          </p>
        ) : (
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {candidates.map((candidate) => (
              <li key={candidate.id}>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => {
                    onPick(candidate.id);
                    onOpenChange(false);
                  }}
                >
                  <span>{candidate.clientName}</span>
                  <span className="text-muted-foreground">
                    {t(`commission.status.${candidate.status}`)}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
