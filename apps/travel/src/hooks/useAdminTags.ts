import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  useBulkCreateTravelTags,
  useDeleteTravelTag,
  useUpdateTravelTag,
  type TravelTagKind,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { useAdminAction } from './useAdminAction';
import { useRowDeletion } from './useRowDeletion';
import { useTagOptions } from './useTagOptions';

export interface TagRow {
  id: string;
  name: string;
  key: string;
  kind: TravelTagKind;
  usageCount: number;
}

export function useAdminTags() {
  const { t } = useTranslation();
  const tags = useTagOptions();
  const update = useUpdateTravelTag();
  const remove = useDeleteTravelTag();
  const bulk = useBulkCreateTravelTags();
  const { run, runBulk } = useAdminAction();
  const [kind, setKind] = useState<TravelTagKind>('DIET');

  const rows: TagRow[] = tags.tags.map((tag) => ({
    id: tag.id,
    name: tags.labelOf(tag.key),
    key: tag.key,
    kind: tag.kind,
    usageCount: tag.usageCount,
  }));

  const columns: EditableColumn<TagRow>[] = [
    { key: 'name', label: t('admin.name'), editable: true, size: 220 },
    {
      key: 'kind',
      label: t('admin.kind'),
      render: (row) => t(`admin.kinds.${row.kind}`),
      size: 120,
    },
    { key: 'key', label: t('admin.code'), size: 160 },
    { key: 'usageCount', label: t('admin.uses'), size: 90 },
  ];

  const deletion = useRowDeletion<TagRow>(
    (row) => run(() => remove.mutateAsync({ id: row.id })),
    (row) => row.usageCount > 0,
  );

  return {
    rows,
    columns,
    kind,
    setKind,
    isLoading: tags.tags.length === 0,
    deletion,
    commit: (id: string, _key: keyof TagRow, value: string) =>
      void run(() => update.mutateAsync({ id, data: { name: value } })),
    add: (names: string[]) =>
      runBulk(() => bulk.mutateAsync({ data: { kind, names } })),
  };
}
