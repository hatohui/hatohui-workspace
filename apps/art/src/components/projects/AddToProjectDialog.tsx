'use client';

import { Plus } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { AssetDto } from '@hatohui/models';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
} from '@hatohui/ui';
import { useAddToProject } from '@/hooks/useAddToProject';

export function AddToProjectDialog({
  asset,
  onClose,
}: {
  asset: AssetDto | null;
  onClose: () => void;
}) {
  const { t } = useTranslation('art');
  const picker = useAddToProject(asset);

  return (
    <Dialog
      open={asset !== null}
      onOpenChange={(open) => {
        if (open) return;
        picker.reset();
        onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('projects.addToProject')}</DialogTitle>
          <DialogDescription>
            {t('projects.addToProjectHint')}
          </DialogDescription>
        </DialogHeader>

        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {picker.projects.map((project) => (
            <li key={project.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted">
                <Checkbox
                  checked={project.checked}
                  onCheckedChange={() => picker.toggle(project.id)}
                />
                {project.title}
              </label>
            </li>
          ))}
        </ul>

        <form
          className="flex gap-2 border-t border-border pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            void picker.createAndAdd();
          }}
        >
          <Input
            aria-label={t('projects.newTitle')}
            placeholder={t('projects.newProjectPlaceholder')}
            value={picker.newTitle}
            onChange={(event) => picker.setNewTitle(event.target.value)}
          />
          <Button
            type="submit"
            variant="outline"
            disabled={!picker.newTitle.trim()}
          >
            <Plus className="size-4" aria-hidden />
            {t('projects.create')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
