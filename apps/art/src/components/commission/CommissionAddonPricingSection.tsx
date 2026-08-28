'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { EditableDataTable, type EditableColumn } from '@hatohui/ui';
import type {
  CommissionAddonPricingDto,
  CommissionAddonPricingDtoPriceMode,
} from '@hatohui/models';
import { useCommissionAddonPricingAdmin } from '@/hooks/useCommissionPricingAdmin';

const DRAFT_ID = '__draft__';
const PRICE_MODES: CommissionAddonPricingDtoPriceMode[] = [
  'FIXED',
  'STARTING_FROM',
  'RANGE',
  'PERCENTAGE',
];

interface AddonRow {
  id: string;
  label: string;
  priceMode: string;
  minPrice: string;
  maxPrice: string;
  percent: string;
  active: string;
}

function toRow(item: CommissionAddonPricingDto): AddonRow {
  return {
    id: item.id,
    label: item.label,
    priceMode: item.priceMode,
    minPrice: item.minPrice != null ? (item.minPrice / 100).toFixed(2) : '',
    maxPrice: item.maxPrice != null ? (item.maxPrice / 100).toFixed(2) : '',
    percent: item.percent != null ? String(item.percent) : '',
    active: String(item.active),
  };
}

function blankDraft(): AddonRow {
  return {
    id: DRAFT_ID,
    label: '',
    priceMode: 'STARTING_FROM',
    minPrice: '',
    maxPrice: '',
    percent: '',
    active: 'true',
  };
}

function toCents(dollars: string): number {
  return Math.round(Number(dollars) * 100);
}

export function CommissionAddonPricingSection() {
  const { t } = useTranslation('art');
  const pricing = useCommissionAddonPricingAdmin();
  const [draft, setDraft] = useState<AddonRow | null>(null);

  const PRICE_MODE_OPTIONS = PRICE_MODES.map((mode) => ({
    label: t(`commission.admin.pricing.priceMode.${mode}`),
    value: mode,
  }));

  const columns: EditableColumn<AddonRow>[] = [
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
      editable: (row) => row.priceMode !== 'PERCENTAGE',
      render: (row) =>
        row.priceMode === 'PERCENTAGE' ? '' : `$${row.minPrice}`,
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
      key: 'percent',
      label: t('commission.admin.pricing.addonsTable.percent'),
      editable: (row) => row.priceMode === 'PERCENTAGE',
      render: (row) =>
        row.priceMode === 'PERCENTAGE' ? `${row.percent}%` : '',
      size: 100,
    },
    {
      key: 'active',
      label: t('commission.admin.pricing.typesTable.columns.active'),
      editable: (row) => row.id !== DRAFT_ID,
      toggle: true,
    },
  ];

  const buildPayload = (row: AddonRow) => ({
    label: row.label.trim(),
    priceMode: row.priceMode as CommissionAddonPricingDto['priceMode'],
    minPrice:
      row.priceMode !== 'PERCENTAGE' && row.minPrice.trim()
        ? toCents(row.minPrice)
        : undefined,
    maxPrice:
      row.priceMode === 'RANGE' && row.maxPrice.trim()
        ? toCents(row.maxPrice)
        : undefined,
    percent:
      row.priceMode === 'PERCENTAGE' && row.percent.trim()
        ? Number(row.percent)
        : undefined,
    active: row.active === 'true',
  });

  const handleCommit = (id: string, key: keyof AddonRow, value: string) => {
    if (id === DRAFT_ID) {
      const next = { ...(draft ?? blankDraft()), [key]: value };
      setDraft(next);
      const ready =
        next.label.trim() &&
        (next.priceMode === 'PERCENTAGE'
          ? next.percent.trim()
          : next.minPrice.trim() &&
            (next.priceMode !== 'RANGE' || next.maxPrice.trim()));
      if (ready) {
        void pricing.create({ data: buildPayload(next) });
        setDraft(null);
      }
      return;
    }

    const existing = pricing.items.find((item) => item.id === id);
    if (!existing) return;
    const next = { ...toRow(existing), [key]: value };
    void pricing.update({ id, data: buildPayload(next) });
  };

  const rows = pricing.items.map(toRow);

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="font-medium">{t('app.commissionSettings.addons')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('app.commissionSettings.addonsHint')}
        </p>
      </div>
      <EditableDataTable
        columns={columns}
        rows={draft ? [...rows, draft] : rows}
        storageKey="commission-addons"
        onCommit={handleCommit}
        onAddRow={() => setDraft((prev) => prev ?? blankDraft())}
        addRowLabel={t('commission.admin.pricing.addonsTable.addRow')}
        onDeleteRow={(row) =>
          row.id === DRAFT_ID ? setDraft(null) : void pricing.remove(row.id)
        }
        deleteRowLabel={t('commission.admin.pricing.optionsTable.deleteRow')}
      />
    </section>
  );
}
