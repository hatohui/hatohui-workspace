'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { EditableDataTable, type EditableColumn } from '@hatohui/ui';
import type { CommissionTypeDto } from '@hatohui/models';
import { useCommissionTypesAdmin } from '@/hooks/useCommissionTypesAdmin';

const DRAFT_ID = '__draft__';

interface CommissionTypeRow {
  id: string;
  key: string;
  label: string;
  basePrice: string;
  active: string;
  tagName: string;
}

function toRow(item: CommissionTypeDto): CommissionTypeRow {
  return {
    id: item.id,
    key: item.key,
    label: item.label,
    basePrice: (item.basePrice / 100).toFixed(2),
    active: String(item.active),
    tagName: item.tagName ?? '',
  };
}

function blankDraft(): CommissionTypeRow {
  return {
    id: DRAFT_ID,
    key: '',
    label: '',
    basePrice: '',
    active: 'true',
    tagName: '',
  };
}

function toCents(dollars: string): number {
  return Math.round(Number(dollars) * 100);
}

export function CommissionTypesTable({ artistId }: { artistId: string }) {
  const { t } = useTranslation('art');
  const { items, create, update } = useCommissionTypesAdmin(artistId);
  const [draft, setDraft] = useState<CommissionTypeRow | null>(null);

  const ACTIVE_OPTIONS = [
    { label: t('commission.admin.pricing.typesTable.active'), value: 'true' },
    {
      label: t('commission.admin.pricing.typesTable.inactive'),
      value: 'false',
    },
  ];

  const columns: EditableColumn<CommissionTypeRow>[] = [
    {
      key: 'key',
      label: t('commission.admin.pricing.typesTable.columns.key'),
      editable: (row) => row.id === DRAFT_ID,
      size: 160,
    },
    {
      key: 'label',
      label: t('commission.admin.pricing.typesTable.columns.label'),
      editable: true,
      size: 200,
    },
    {
      key: 'basePrice',
      label: t('commission.admin.pricing.typesTable.columns.basePrice'),
      editable: true,
      render: (row) => `$${row.basePrice}`,
      size: 140,
    },
    {
      key: 'active',
      label: t('commission.admin.pricing.typesTable.columns.active'),
      editable: (row) => row.id !== DRAFT_ID,
      options: ACTIVE_OPTIONS,
      render: (row) =>
        row.active === 'true'
          ? t('commission.admin.pricing.typesTable.active')
          : t('commission.admin.pricing.typesTable.inactive'),
      size: 120,
    },
    {
      key: 'tagName',
      label: t('commission.admin.pricing.typesTable.columns.tag'),
      editable: false,
      size: 160,
    },
  ];

  const handleCommit = (
    id: string,
    key: keyof CommissionTypeRow,
    value: string,
  ) => {
    if (id === DRAFT_ID) {
      const next = { ...(draft ?? blankDraft()), [key]: value };
      setDraft(next);
      if (next.key.trim() && next.label.trim() && next.basePrice.trim()) {
        void create({
          data: {
            key: next.key.trim(),
            label: next.label.trim(),
            basePrice: toCents(next.basePrice),
          },
        });
        setDraft(null);
      }
      return;
    }

    const existing = items.find((item) => item.id === id);
    if (!existing) return;

    void update({
      id,
      data: {
        key: existing.key,
        label: key === 'label' ? value : existing.label,
        basePrice: key === 'basePrice' ? toCents(value) : existing.basePrice,
        active: key === 'active' ? value === 'true' : existing.active,
      },
    });
  };

  const rows = items.map(toRow);

  return (
    <EditableDataTable
      columns={columns}
      rows={draft ? [...rows, draft] : rows}
      storageKey="commission-types"
      onCommit={handleCommit}
      onAddRow={() => setDraft((prev) => prev ?? blankDraft())}
      addRowLabel={t('commission.admin.pricing.typesTable.addRow')}
    />
  );
}
