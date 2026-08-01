'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import { useProjectsAdmin } from '@/hooks/useProjects';

export function ProjectCreateForm() {
  const { t } = useTranslation('art');
  const { create } = useProjectsAdmin();
  const [title, setTitle] = useState('');

  return (
    <section>
      <h1 className="mb-2 font-serif text-2xl">{t('projects.title')}</h1>
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="project-title">{t('projects.newTitle')}</Label>
          <Input
            id="project-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <Button
          className="self-end"
          disabled={!title}
          onClick={() => {
            void create({ data: { title } }).then(() => setTitle(''));
          }}
        >
          {t('projects.create')}
        </Button>
      </div>
    </section>
  );
}
