'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { CommentDto, CreateCommentDtoVisibility } from '@hatohui/models';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@hatohui/ui';

export function CommissionAdminNotes({
  notes,
  onAdd,
}: {
  notes: CommentDto[];
  onAdd: (
    body: string,
    visibility: CreateCommentDtoVisibility,
  ) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] =
    useState<CreateCommentDtoVisibility>('INTERNAL');

  return (
    <div className="rounded-lg border border-border p-4">
      <h2 className="mb-2 text-sm font-medium">
        {t('commission.admin.detail.notes')}
      </h2>
      <div className="space-y-2">
        {notes.map((note) => (
          <p key={note.id} className="rounded-md bg-card p-3 text-sm">
            <span className="mr-2 text-xs text-muted-foreground">
              {note.visibility === 'CLIENT'
                ? t('commission.admin.detail.noteVisibilityClient')
                : t('commission.admin.detail.noteVisibilityInternal')}
            </span>
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
        <div className="flex items-center gap-2">
          <Select
            value={visibility}
            onValueChange={(value) =>
              setVisibility(value as CreateCommentDtoVisibility)
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INTERNAL">
                {t('commission.admin.detail.noteVisibilityInternal')}
              </SelectItem>
              <SelectItem value="CLIENT">
                {t('commission.admin.detail.noteVisibilityClient')}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            disabled={!body.trim()}
            onClick={() => {
              void onAdd(body, visibility).then(() => setBody(''));
            }}
          >
            {t('commission.admin.detail.addNote')}
          </Button>
        </div>
      </div>
    </div>
  );
}
