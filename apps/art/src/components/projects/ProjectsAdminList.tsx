'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { useProjectsAdmin } from '@/hooks/useProjects';

export function ProjectsAdminList() {
  const { t } = useTranslation('art');
  const { items, updateVisibility, remove } = useProjectsAdmin();

  if (items.length === 0) {
    return <p className="text-muted-foreground">{t('projects.empty')}</p>;
  }

  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between rounded-md bg-card p-2 text-sm"
        >
          <span>
            {item.title} ({item.commissionCount})
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                void updateVisibility({
                  id: item.id,
                  data: { isHidden: !item.isHidden },
                })
              }
            >
              {item.isHidden
                ? t('commission.admin.visibility.show')
                : t('commission.admin.visibility.hide')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void remove(item.id)}
            >
              {t('gallery.card.delete')}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
