'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { CommentDto } from '@hatohui/models';
import { Button, Textarea, cn } from '@hatohui/ui';
import { useCommissionFormatters } from '@/hooks/useCommissionFormatters';

export function OrderNotesThread({
  notes,
  onAdd,
}: {
  notes: CommentDto[];
  onAdd: (body: string) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');
  const format = useCommissionFormatters();
  const [body, setBody] = useState('');

  return (
    <div className="space-y-4">
      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('orders.noMessages')}
        </p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li
              key={note.id}
              className={cn(
                'max-w-[85%] rounded-lg p-3 text-sm',
                note.authorRole === 'CLIENT'
                  ? 'ml-auto bg-primary/10'
                  : 'bg-card',
              )}
            >
              <p className="whitespace-pre-wrap">{note.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {format.dateTime(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-2">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={t('commission.admin.detail.notePlaceholder')}
        />
        <Button
          size="sm"
          disabled={!body.trim()}
          onClick={() => {
            void onAdd(body).then(() => setBody(''));
          }}
        >
          {t('commission.admin.detail.addNote')}
        </Button>
      </div>
    </div>
  );
}
