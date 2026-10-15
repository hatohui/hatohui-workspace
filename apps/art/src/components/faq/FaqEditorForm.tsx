'use client';

import { Plus } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { FaqItemDto, UpdateArtistFaqDto } from '@hatohui/models';
import { Button, Spinner } from '@hatohui/ui';
import { useFaqForm } from '@/hooks/useFaqForm';
import { FaqEditorRow } from './FaqEditorRow';

export function FaqEditorForm({
  initial,
  saving,
  onSave,
}: {
  initial: FaqItemDto[];
  saving: boolean;
  onSave: (args: { data: UpdateArtistFaqDto }) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');
  const form = useFaqForm(initial, onSave);

  return (
    <div className="max-w-2xl space-y-4">
      {form.items.length === 0 && (
        <p className="text-muted-foreground">{t('app.faq.empty')}</p>
      )}
      {form.items.map((item, index) => (
        <FaqEditorRow
          key={index}
          item={item}
          isFirst={index === 0}
          isLast={index === form.items.length - 1}
          onChange={(patch) => form.change(index, patch)}
          onMove={(offset) => form.move(index, offset)}
          onRemove={() => form.remove(index)}
        />
      ))}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!form.canAdd}
          onClick={form.add}
        >
          <Plus />
          {t('app.faq.add')}
        </Button>
        <Button disabled={saving} onClick={() => void form.save()}>
          {saving && <Spinner className="size-4" />}
          {t('app.faq.save')}
        </Button>
      </div>
    </div>
  );
}
