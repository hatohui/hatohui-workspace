'use client';

import { useTranslation } from '@hatohui/i18n';
import { cn, Switch } from '@hatohui/ui';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ArtistCommissionTypeDto } from '@hatohui/models';
import { CommissionTypeCardBody } from './CommissionTypeCardBody';
import { CommissionTypeExamples } from './CommissionTypeExamples';

export function CommissionTypeCard({
  type,
  onToggle,
}: {
  type: ArtistCommissionTypeDto;
  onToggle: (enabled: boolean) => void;
}) {
  const { t } = useTranslation('art');
  const needsPrice = type.enabled && type.startingPrice == null;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: type.commissionTypeId });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-background',
        isDragging && 'relative z-10 shadow-lg',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2.5',
          !type.enabled && 'bg-muted/30',
        )}
      >
        <button
          type="button"
          aria-label={t('app.commissionSettings.reorderHandle')}
          className="-ml-1 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden />
        </button>

        <span
          className={cn(
            'font-medium',
            !type.enabled && 'text-muted-foreground',
          )}
        >
          {type.label}
        </span>

        {needsPrice && (
          <span className="text-sm text-destructive">
            {t('app.commissionSettings.typeNeedsPrice')}
          </span>
        )}

        <Switch
          className="ml-auto"
          checked={type.enabled}
          onCheckedChange={onToggle}
        />
      </div>

      {type.enabled && (
        <div className="space-y-5 border-t border-border p-4">
          <CommissionTypeCardBody
            commissionTypeId={type.commissionTypeId}
            typeLabel={type.label}
          />
          <CommissionTypeExamples tagName={type.tagName} />
        </div>
      )}
    </div>
  );
}
