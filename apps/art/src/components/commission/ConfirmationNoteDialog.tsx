'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Textarea,
} from '@hatohui/ui';

/** The PRD's price-changed-since-acceptance guard: "a modal requires a note
 * explaining why before sending." Only shown when the quote actually moved. */
export function ConfirmationNoteDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (note: string) => void;
}) {
  const { t } = useTranslation('art');
  const [note, setNote] = useState('');

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setNote('');
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('commission.admin.accepted.quoteChangedTitle')}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t('commission.admin.accepted.quoteChangedDescription')}
        </p>
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t('commission.admin.accepted.quoteChangedPlaceholder')}
        />
        <Button
          disabled={!note.trim()}
          onClick={() => {
            onSubmit(note.trim());
            setNote('');
            onOpenChange(false);
          }}
        >
          {t('commission.admin.accepted.sendConfirmation')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
