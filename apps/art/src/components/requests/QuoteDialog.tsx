'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from '@hatohui/ui';
import type { useQuoteDialog } from '@/hooks/useQuoteDialog';

export function QuoteDialog({
  dialog,
}: {
  dialog: ReturnType<typeof useQuoteDialog>;
}) {
  const { t } = useTranslation('art');
  const { target, mode } = dialog;

  return (
    <Dialog
      open={dialog.isOpen}
      onOpenChange={(open) => !open && dialog.close()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(`app.quotes.title.${mode}`)}</DialogTitle>
          <DialogDescription>
            {t(`app.quotes.description.${mode}`, {
              name: target?.clientName ?? '',
            })}
          </DialogDescription>
        </DialogHeader>

        <form
          id="quote-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            dialog.submit();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="quote-amount" required>
              {t('app.quotes.amount', { currency: target?.currency ?? '' })}
            </Label>
            <Input
              id="quote-amount"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              required
              className="max-w-40"
              value={dialog.amount}
              onChange={(event) => dialog.setAmount(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t('app.quotes.estimate', { estimate: dialog.estimate })}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quote-message">{t('app.quotes.message')}</Label>
            <Textarea
              id="quote-message"
              rows={4}
              placeholder={t('app.quotes.messagePlaceholder')}
              value={dialog.message}
              onChange={(event) => dialog.setMessage(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t('app.quotes.messageHint')}
            </p>
          </div>
        </form>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={dialog.close}>
            {t('app.quotes.cancel')}
          </Button>
          <Button type="submit" form="quote-form" disabled={!dialog.isValid}>
            {t(`app.quotes.submit.${mode}`)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
