import type { ReactNode } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { EditableDataTable, Skeleton, type EditableColumn } from '@hatohui/ui';
import { useAdminTableSearch } from '../../hooks/useAdminTableSearch';
import type { useRowDeletion } from '../../hooks/useRowDeletion';
import SearchField from '../shared/SearchField';
import DeleteRowDialog from './DeleteRowDialog';
import QuickAddBar from './QuickAddBar';

interface Props<T extends { id: string; name: string }> {
  storageKey: string;
  addPlaceholder: string;
  deleteDescription: string;
  rows: T[];
  columns: EditableColumn<T>[];
  isLoading: boolean;
  deletion: ReturnType<typeof useRowDeletion<T>>;
  commit: (id: string, key: keyof T & string, value: string) => void;
  add: (names: string[]) => Promise<boolean>;
  addControls?: ReactNode;
}

function AdminTable<T extends { id: string; name: string }>(props: Props<T>) {
  const { t } = useTranslation();
  const tableSearch = useAdminTableSearch(props.rows, props.columns);

  return (
    <div className="space-y-4">
      <QuickAddBar placeholder={props.addPlaceholder} onAdd={props.add}>
        {props.addControls}
      </QuickAddBar>
      <SearchField
        value={tableSearch.search}
        placeholder={t('admin.searchPlaceholder')}
        onChange={tableSearch.setSearch}
        suggestions={tableSearch.suggestions}
      />
      {props.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <EditableDataTable
          storageKey={props.storageKey}
          columns={props.columns}
          rows={tableSearch.filteredRows}
          onCommit={props.commit}
          onDeleteRow={props.deletion.request}
          deleteRowLabel={t('recommendation.delete')}
        />
      )}
      <DeleteRowDialog
        name={props.deletion.pending?.name ?? null}
        description={props.deleteDescription}
        onConfirm={() => void props.deletion.confirm()}
        onCancel={props.deletion.cancel}
      />
    </div>
  );
}

export default AdminTable;
