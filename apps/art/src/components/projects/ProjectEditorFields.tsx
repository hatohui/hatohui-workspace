'use client';

import { useTranslation } from '@hatohui/i18n';
import type { ProjectDto } from '@hatohui/models';
import { Button, Input, Label, Switch, Textarea } from '@hatohui/ui';
import type { useProjectEditor } from '@/hooks/useProjectEditor';

export function ProjectEditorFields({
  project,
  editor,
}: {
  project: ProjectDto;
  editor: ReturnType<typeof useProjectEditor>;
}) {
  const { t } = useTranslation('art');

  return (
    <section className="space-y-4">
      <Input
        aria-label={t('projects.newTitle')}
        defaultValue={project.title}
        className="h-auto border-none bg-transparent px-0 font-serif text-3xl shadow-none focus-visible:ring-0"
        onBlur={(event) => editor.saveTitle(event.target.value)}
      />
      <div className="space-y-1.5">
        <Label htmlFor="project-description">{t('projects.description')}</Label>
        <Textarea
          id="project-description"
          rows={3}
          defaultValue={project.description ?? ''}
          placeholder={t('projects.descriptionPlaceholder')}
          onBlur={(event) => editor.saveDescription(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-3 text-sm">
          <Switch
            checked={!project.isHidden}
            onCheckedChange={editor.setVisible}
          />
          {t('projects.visibleOnProfile')}
        </label>
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => editor.setIsConfirmingDelete(true)}
        >
          {t('projects.delete')}
        </Button>
      </div>
    </section>
  );
}
