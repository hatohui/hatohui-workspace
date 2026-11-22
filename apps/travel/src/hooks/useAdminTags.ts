import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  getTravelTagsQueryKey,
  useBulkCreateTravelTags,
  useDeleteTravelTag,
  useUpdateTravelTag,
  type TravelTagDto,
  type TravelTagKind,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import { TAG_KINDS } from '../constants/admin';
import { formatAddedDate } from '../lib/formatDate';
import { useAdminAction } from './useAdminAction';
import { useRowDeletion } from './useRowDeletion';
import { useTagOptions } from './useTagOptions';

export interface TagRow {
  id: string;
  name: string;
  key: string;
  kind: TravelTagKind;
  usageCount: number;
  createdAt: string;
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
    createdAt: tag.createdAt,
  }));

  const columns: EditableColumn<TagRow>[] = [
    {
      key: 'name',
      label: t('admin.name'),
      editable: true,
      sortable: true,
      size: 220,
    },
    {
      key: 'kind',
      label: t('admin.kind'),
      editable: true,
      sortable: true,
      options: TAG_KINDS.map((option) => ({
        value: option,
        label: t(`admin.kinds.${option}`),
      })),
      render: (row) => t(`admin.kinds.${row.kind}`),
      size: 120,
    },
    { key: 'key', label: t('admin.code'), sortable: true, size: 160 },
    { key: 'usageCount', label: t('admin.uses'), sortable: true, size: 90 },
    {
      key: 'createdAt',
      label: t('admin.added'),
      sortable: true,
      render: (row) => formatAddedDate(row.createdAt),
      size: 130,
    },
  ];

  const tagsQueryKey = getTravelTagsQueryKey();

  const deletion = useRowDeletion<TagRow>(
    (row) =>
      run<{ data: TravelTagDto[] }>(() => remove.mutateAsync({ id: row.id }), {
        queryKey: tagsQueryKey,
        apply: (current) => ({
          ...current,
          data: current.data.filter((item) => item.id !== row.id),
        }),
      }),
    (row) => row.usageCount > 0,
  );

  return {
    rows,
    columns,
    kind,
    setKind,
    isLoading: tags.tags.length === 0,
    deletion,
    commit: (id: string, key: keyof TagRow, value: string) =>
      void run<{ data: TravelTagDto[] }>(
        () =>
          update.mutateAsync({
            id,
            data:
              key === 'kind'
                ? { kind: value as TravelTagKind }
                : { name: value },
          }),
        {
          queryKey: tagsQueryKey,
          apply: (current) => ({
            ...current,
            data: current.data.map((item) =>
              item.id === id
                ? {
                    ...item,
                    ...(key === 'kind'
                      ? { kind: value as TravelTagKind }
                      : { name: value }),
                  }
                : item,
            ),
          }),
        },
      ),
    add: (names: string[]) =>
      runBulk(() => bulk.mutateAsync({ data: { kind, names } })),
  };
}
