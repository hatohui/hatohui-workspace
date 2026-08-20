import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  ConfirmDialog,
  EditableDataTable,
  type EditableColumn,
} from '@hatohui/ui';
import type { AdminSystemParameterDto } from '@hatohui/models';
import { ADMIN_EMAIL_CONFIG_TYPE } from '../../constants/admin';

interface SystemParametersTableProps {
  rows: AdminSystemParameterDto[];
  onCommit: (id: string, value: string) => void;
}

function SystemParametersTable({ rows, onCommit }: SystemParametersTableProps) {
  const { t } = useTranslation('workspace');
  const [pending, setPending] = useState<{
    id: string;
    from: string;
    to: string;
  } | null>(null);

  const columns: EditableColumn<AdminSystemParameterDto>[] = [
    {
      key: 'type',
      label: t('settings.columns.type'),
      editable: false,
      width: '30%',
    },
    {
      key: 'scope',
      label: t('settings.columns.scope'),
      editable: false,
      width: '15%',
    },
    {
      key: 'value',
      label: t('settings.columns.value'),
      editable: true,
      width: '35%',
    },
    {
      key: 'updatedAt',
      label: t('settings.columns.updatedAt'),
      editable: false,
      width: '20%',
      render: (row) => new Date(row.updatedAt).toLocaleString(),
    },
  ];

  const handleCommit = (
    id: string,
    key: keyof AdminSystemParameterDto,
    value: string,
  ) => {
    if (key !== 'value') return;
    const row = rows.find((r) => r.id === id);
    if (row?.type === ADMIN_EMAIL_CONFIG_TYPE) {
      setPending({ id, from: row.value, to: value });
      return;
    }
    onCommit(id, value);
  };

  return (
    <>
      <EditableDataTable
        columns={columns}
        rows={rows}
        storageKey="system-parameters"
        onCommit={handleCommit}
      />
      <ConfirmDialog
        open={pending !== null}
        title={t('settings.confirmTitle')}
        description={t('settings.confirmDescription', {
          from: pending?.from ?? '',
          to: pending?.to ?? '',
        })}
        cancelLabel={t('settings.confirmCancel')}
        confirmLabel={t('settings.confirmSubmit')}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) onCommit(pending.id, pending.to);
          setPending(null);
        }}
      />
    </>
  );
}

export default SystemParametersTable;
