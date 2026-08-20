import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  ConfirmDialog,
  EditableDataTable,
  type EditableColumn,
} from '@hatohui/ui';
import {
  AdminSystemParameterDtoScope,
  type AdminSystemParameterDto,
  type CreateAdminSystemParameterDto,
} from '@hatohui/models';
import { ADMIN_EMAIL_CONFIG_TYPE } from '../../constants/admin';

const DRAFT_ID = '__draft__';
const SCOPE_OPTIONS = Object.values(AdminSystemParameterDtoScope).map(
  (scope) => ({ label: scope, value: scope }),
);

function blankDraft(): AdminSystemParameterDto {
  return {
    id: DRAFT_ID,
    type: '',
    scope: AdminSystemParameterDtoScope.ALL,
    value: '',
    updatedAt: new Date().toISOString(),
  };
}

interface SystemParametersTableProps {
  rows: AdminSystemParameterDto[];
  onCommit: (id: string, value: string) => void;
  onCreate: (dto: CreateAdminSystemParameterDto) => void;
}

function SystemParametersTable({
  rows,
  onCommit,
  onCreate,
}: SystemParametersTableProps) {
  const { t } = useTranslation('workspace');
  const [pending, setPending] = useState<{
    id: string;
    from: string;
    to: string;
  } | null>(null);
  const [draft, setDraft] = useState<AdminSystemParameterDto | null>(null);

  const columns: EditableColumn<AdminSystemParameterDto>[] = [
    {
      key: 'type',
      label: t('systemParameters.columns.type'),
      editable: (row) => row.id === DRAFT_ID,
      size: 260,
    },
    {
      key: 'scope',
      label: t('systemParameters.columns.scope'),
      editable: (row) => row.id === DRAFT_ID,
      options: SCOPE_OPTIONS,
      size: 120,
    },
    {
      key: 'value',
      label: t('systemParameters.columns.value'),
      editable: true,
      size: 300,
    },
    {
      key: 'updatedAt',
      label: t('systemParameters.columns.updatedAt'),
      editable: false,
      render: (row) => new Date(row.updatedAt).toLocaleString(),
      size: 180,
    },
  ];

  const handleCommit = (
    id: string,
    key: keyof AdminSystemParameterDto,
    value: string,
  ) => {
    if (id === DRAFT_ID) {
      if (!draft) return;
      const next = { ...draft, [key]: value };
      setDraft(next);
      if (next.type.trim() && next.value.trim()) {
        onCreate({
          type: next.type.trim(),
          scope: next.scope,
          value: next.value.trim(),
        });
        setDraft(null);
      }
      return;
    }

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
        rows={draft ? [...rows, draft] : rows}
        storageKey="system-parameters"
        onCommit={handleCommit}
        onAddRow={() => setDraft((prev) => prev ?? blankDraft())}
        addRowLabel={t('systemParameters.addRow')}
      />
      <ConfirmDialog
        open={pending !== null}
        title={t('systemParameters.confirmTitle')}
        description={t('systemParameters.confirmDescription', {
          from: pending?.from ?? '',
          to: pending?.to ?? '',
        })}
        cancelLabel={t('systemParameters.confirmCancel')}
        confirmLabel={t('systemParameters.confirmSubmit')}
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
