'use client';

import { useTranslation } from '@hatohui/i18n';
import { Skeleton } from '@hatohui/ui';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCommissionTypesAdmin } from '@/hooks/useCommissionTypesAdmin';
import { CommissionTypeCard } from './CommissionTypeCard';

export function CommissionTypesEditor() {
  const { t } = useTranslation('art');
  const { items, isLoading, setEnabled, reorder } = useCommissionTypesAdmin();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  const ordered = [...items].sort((a, b) => a.no - b.no);
  const ids = ordered.map((type) => type.commissionTypeId);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    void reorder(arrayMove(ids, from, to));
  };

  if (ordered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('app.commissionSettings.noTypes')}
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {ordered.map((type) => (
            <CommissionTypeCard
              key={type.commissionTypeId}
              type={type}
              onToggle={(enabled) =>
                void setEnabled({
                  id: type.commissionTypeId,
                  data: { active: enabled, no: type.no },
                })
              }
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
