import type { ReactNode } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { EditableDataTable, Skeleton, type EditableColumn } from '@hatohui/ui';
import { useAdminTableControls } from '../../hooks/useAdminTableControls';
import type { useRowDeletion } from '../../hooks/useRowDeletion';
import SearchField from '../shared/SearchField';
import DeleteRowDialog from './DeleteRowDialog';
import QuickAddBar from './QuickAddBar';
import TablePagination from './TablePagination';

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
  const controls = useAdminTableControls(props.rows, props.columns);

  return (
    <div className="space-y-4">
      <QuickAddBar placeholder={props.addPlaceholder} onAdd={props.add}>
        {props.addControls}
      </QuickAddBar>
      <SearchField
        value={controls.search}
        placeholder={t('admin.searchPlaceholder')}
        onChange={controls.setSearch}
        suggestions={controls.suggestions}
      />
      {props.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <>
          <EditableDataTable
            storageKey={props.storageKey}
            columns={props.columns}
            rows={controls.pagedRows}
            sortBy={controls.sortBy}
            sortDirection={controls.sortDirection}
            onSortChange={controls.onSortChange}
            onCommit={props.commit}
            onDeleteRow={props.deletion.request}
            deleteRowLabel={t('recommendation.delete')}
          />
          <TablePagination
            page={controls.page}
            pageSize={controls.pageSize}
            totalRows={controls.totalRows}
            totalPages={controls.totalPages}
            onPageChange={controls.setPage}
            onPageSizeChange={controls.setPageSize}
          />
        </>
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
