'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import { useReferenceLinkInput } from '@/hooks/useReferenceLinkInput';
import { CommissionFieldError } from './CommissionFieldError';
import { ReferenceLinkChip } from './ReferenceLinkChip';

export function CommissionReferenceLinks({
  links,
  onChange,
}: {
  links: string[];
  onChange: (links: string[]) => void;
}) {
  const { t } = useTranslation('art');
  const input = useReferenceLinkInput(links, onChange);

  return (
    <div className="space-y-1.5">
      <Label htmlFor="referenceLink">{t('orders.addLinkLabel')}</Label>
      <div className="flex gap-2">
        <Input
          id="referenceLink"
          type="url"
          inputMode="url"
          placeholder={t('orders.addLinkPlaceholder')}
          value={input.draft}
          disabled={input.isFull}
          aria-invalid={input.error ? true : undefined}
          aria-describedby="referenceLink-error"
          onChange={(event) => input.setDraft(event.target.value)}
          onKeyDown={input.onKeyDown}
        />
        <Button
          type="button"
          variant="outline"
          disabled={input.isFull || !input.draft.trim()}
          onClick={input.add}
        >
          {t('orders.addLink')}
        </Button>
      </div>
      <CommissionFieldError
        id="referenceLink-error"
        message={input.error}
        hint={input.isFull ? input.limitHint : t('commission.form.hints.links')}
      />
      {links.length > 0 && (
        <ul className="flex flex-wrap gap-2 pt-1">
          {links.map((url) => (
            <ReferenceLinkChip
              key={url}
              url={url}
              onRemove={() => input.remove(url)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
