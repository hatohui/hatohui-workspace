import { useMemo, useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { EditableColumn } from '@hatohui/ui';
import {
  ADMIN_FILTER_EMPTY,
  ADMIN_FILTER_NONE,
  ADMIN_FILTER_SOME,
  CUISINE_LIST_SEPARATOR,
} from '../constants/admin';

export interface ColumnFilterValue {
  value: string;
  label: string;
  count: number;
}

export interface FilterableColumn {
  key: string;
  label: string;
  values: ColumnFilterValue[];
}

type Selection = Record<string, string[]>;

function valuesOf<T>(row: T, column: EditableColumn<T>): string[] {
  const raw = row[column.key];
  if (typeof raw === 'number') {
    return [raw > 0 ? ADMIN_FILTER_SOME : ADMIN_FILTER_NONE];
  }
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (column.suggestions) {
    const parts = text
      .split(CUISINE_LIST_SEPARATOR)
      .map((part) => part.trim())
      .filter(Boolean);
    return parts.length ? parts : [ADMIN_FILTER_EMPTY];
  }
  return [text || ADMIN_FILTER_EMPTY];
}

function isFilterable<T>(column: EditableColumn<T>, rows: T[]) {
  if (column.suggestions || column.options) return true;
  return rows.length > 0 && typeof rows[0][column.key] === 'number';
}

export function useAdminColumnFilters<T>(
  rows: T[],
  columns: EditableColumn<T>[],
) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Selection>({});

  const labelFor = (column: EditableColumn<T>, value: string) => {
    if (value === ADMIN_FILTER_EMPTY) return t('admin.filter.empty');
    if (value === ADMIN_FILTER_NONE) return t('admin.filter.none');
    if (value === ADMIN_FILTER_SOME) return t('admin.filter.some');
    return column.options?.find((o) => o.value === value)?.label ?? value;
  };

  const filterable: FilterableColumn[] = columns
    .filter((column) => isFilterable(column, rows))
    .map((column) => {
      const counts = new Map<string, number>();
      for (const row of rows) {
        for (const value of valuesOf(row, column)) {
          counts.set(value, (counts.get(value) ?? 0) + 1);
        }
      }
      const values = [...counts.entries()]
        .map(([value, count]) => ({
          value,
          count,
          label: labelFor(column, value),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      return { key: column.key, label: column.label, values };
    })
    .filter((column) => column.values.length > 1);

  const filteredRows = useMemo(() => {
    const active = Object.entries(selected).filter(([, v]) => v.length);
    if (!active.length) return rows;
    return rows.filter((row) =>
      active.every(([key, wanted]) => {
        const column = columns.find((c) => c.key === key);
        return column
          ? valuesOf(row, column).some((v) => wanted.includes(v))
          : true;
      }),
    );
  }, [columns, rows, selected]);

  const toggle = (key: string, value: string) =>
    setSelected((current) => {
      const list = current[key] ?? [];
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];
      return { ...current, [key]: next };
    });

  const active = filterable.flatMap((column) =>
    (selected[column.key] ?? []).map((value) => ({
      key: column.key,
      value,
      label: `${column.label}: ${column.values.find((v) => v.value === value)?.label ?? value}`,
    })),
  );

  return {
    columns: filterable,
    selected,
    active,
    toggle,
    clear: () => setSelected({}),
    filteredRows,
  };
}

export type AdminColumnFilters = ReturnType<typeof useAdminColumnFilters>;
