'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@hatohui/ui';

export function NewProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (title: string) => Promise<void>;
}) {
  const { t } = useTranslation('art');
  const [title, setTitle] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('projects.newProject')}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) return;
            void onCreate(title.trim()).then(() => setTitle(''));
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="new-project-title">{t('projects.newTitle')}</Label>
            <Input
              id="new-project-title"
              autoFocus
              value={title}
              placeholder={t('projects.titlePlaceholder')}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!title.trim()}>
              {t('projects.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
