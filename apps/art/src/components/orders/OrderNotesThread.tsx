'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { CommissionNoteDto } from '@hatohui/models';
import { Button, Textarea } from '@hatohui/ui';

export function OrderNotesThread({
  notes,
  onAdd,
}: {
  notes: CommissionNoteDto[];
  onAdd: (body: string) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');
  const [body, setBody] = useState('');

  return (
    <div>
      <h2 className="font-medium">{t('commission.admin.detail.notes')}</h2>
      <div className="mt-2 space-y-2">
        {notes.map((note) => (
          <p key={note.id} className="rounded-md bg-card p-3 text-sm">
            {note.body}
          </p>
        ))}
      </div>
      <div className="mt-2 space-y-2">
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
