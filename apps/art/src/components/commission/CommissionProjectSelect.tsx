'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { useProjects } from '@/hooks/useProjects';

const NONE_VALUE = '__none__';

export function CommissionProjectSelect({
  projectId,
  onChange,
}: {
  projectId: string | null;
  onChange: (projectId: string | null) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');
  const { items } = useProjects();

  return (
    <div>
      <Label>{t('projects.title')}</Label>
      <Select
        value={projectId ?? NONE_VALUE}
        onValueChange={(value) =>
          void onChange(value === NONE_VALUE ? null : value)
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE}>{t('projects.none')}</SelectItem>
          {items.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
