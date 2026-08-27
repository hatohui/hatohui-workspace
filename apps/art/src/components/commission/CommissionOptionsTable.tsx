'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { EditableDataTable, type EditableColumn } from '@hatohui/ui';
import type {
  CommissionOptionPricingDto,
  CommissionOptionPricingDtoPriceMode,
} from '@hatohui/models';
import { useCommissionOptionPricingAdmin } from '@/hooks/useCommissionPricingAdmin';

const DRAFT_ID = '__draft__';
const PRICE_MODES: CommissionOptionPricingDtoPriceMode[] = [
  'FIXED',
  'STARTING_FROM',
  'RANGE',
];

interface OptionRow {
  id: string;
  label: string;
  priceMode: string;
  minPrice: string;
  maxPrice: string;
  active: string;
}

function toRow(item: CommissionOptionPricingDto): OptionRow {
  return {
    id: item.id,
    label: item.label,
    priceMode: item.priceMode,
    minPrice: (item.minPrice / 100).toFixed(2),
    maxPrice: item.maxPrice != null ? (item.maxPrice / 100).toFixed(2) : '',
    active: String(item.active),
  };
}

function blankDraft(): OptionRow {
  return {
    id: DRAFT_ID,
    label: '',
    priceMode: 'FIXED',
    minPrice: '',
    maxPrice: '',
    active: 'true',
  };
}

function toCents(dollars: string): number {
  return Math.round(Number(dollars) * 100);
}

export function CommissionOptionsTable({
  commissionTypeId,
}: {
  commissionTypeId: string;
}) {
  const { t } = useTranslation('art');
  const { items, create, update, remove } =
    useCommissionOptionPricingAdmin(commissionTypeId);
  const [draft, setDraft] = useState<OptionRow | null>(null);

  const ACTIVE_OPTIONS = [
    { label: t('commission.admin.pricing.typesTable.active'), value: 'true' },
    {
      label: t('commission.admin.pricing.typesTable.inactive'),
      value: 'false',
    },
  ];

  const PRICE_MODE_OPTIONS = PRICE_MODES.map((mode) => ({
    label: t(`commission.admin.pricing.priceMode.${mode}`),
    value: mode,
  }));

  const columns: EditableColumn<OptionRow>[] = [
    {
      key: 'label',
      label: t('commission.admin.pricing.typesTable.columns.label'),
      editable: true,
      size: 180,
    },
    {
      key: 'priceMode',
      label: t('commission.admin.pricing.optionsTable.priceMode'),
      editable: true,
      options: PRICE_MODE_OPTIONS,
      render: (row) => t(`commission.admin.pricing.priceMode.${row.priceMode}`),
      size: 160,
    },
    {
      key: 'minPrice',
      label: t('commission.admin.pricing.optionsTable.minPrice'),
      editable: true,
      render: (row) => `$${row.minPrice}`,
      size: 120,
    },
    {
      key: 'maxPrice',
      label: t('commission.admin.pricing.optionsTable.maxPrice'),
      editable: (row) => row.priceMode === 'RANGE',
      render: (row) => (row.maxPrice ? `$${row.maxPrice}` : ''),
      size: 120,
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
  ];

  const handleCommit = (id: string, key: keyof OptionRow, value: string) => {
    if (id === DRAFT_ID) {
      const next = { ...(draft ?? blankDraft()), [key]: value };
      setDraft(next);
      if (next.label.trim() && next.minPrice.trim()) {
        void create({
          data: {
            commissionTypeId,
            label: next.label.trim(),
            priceMode:
              next.priceMode as CommissionOptionPricingDto['priceMode'],
            minPrice: toCents(next.minPrice),
            maxPrice: next.maxPrice.trim() ? toCents(next.maxPrice) : undefined,
          },
        });
        setDraft(null);
      }
      return;
    }

    const existing = items.find((item) => item.id === id);
    if (!existing) return;

    const next = { ...toRow(existing), [key]: value };
    void update({
      id,
      data: {
        commissionTypeId,
        label: next.label,
        priceMode: next.priceMode as CommissionOptionPricingDto['priceMode'],
        minPrice: toCents(next.minPrice),
        maxPrice: next.maxPrice.trim() ? toCents(next.maxPrice) : undefined,
        active: next.active === 'true',
      },
    });
  };

  const rows = items.map(toRow);

  return (
    <EditableDataTable
      columns={columns}
      rows={draft ? [...rows, draft] : rows}
      storageKey={`commission-options-${commissionTypeId}`}
      onCommit={handleCommit}
      onAddRow={() => setDraft((prev) => prev ?? blankDraft())}
      addRowLabel={t('commission.admin.pricing.optionsTable.addRow')}
      onDeleteRow={(row) =>
        row.id === DRAFT_ID ? setDraft(null) : void remove(row.id)
      }
      deleteRowLabel={t('commission.admin.pricing.optionsTable.deleteRow')}
    />
  );
}
