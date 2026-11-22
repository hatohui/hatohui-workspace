import { useRef, type ReactNode } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { EditableDataTable, Skeleton, type EditableColumn } from '@hatohui/ui';
import { useAdminColumnFilters } from '../../hooks/useAdminColumnFilters';
import { useAdminTableControls } from '../../hooks/useAdminTableControls';
import { useAutoFitRows } from '../../hooks/useAutoFitRows';
import { useColumnVisibility } from '../../hooks/useColumnVisibility';
import type { useRowDeletion } from '../../hooks/useRowDeletion';
import AdminTableToolbar from './AdminTableToolbar';
import DeleteRowDialog from './DeleteRowDialog';
import QuickAddBar from './QuickAddBar';
import TablePagination from './TablePagination';

const DEFAULT_HIDDEN_COLUMNS = ['createdAt'] as const;

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
  toolbarActions?: ReactNode;
}

function AdminTable<T extends { id: string; name: string }>(props: Props<T>) {
  const { t } = useTranslation();
  const tableRef = useRef<HTMLDivElement>(null);
  const autoRows = useAutoFitRows(tableRef, props.isLoading);
  const filters = useAdminColumnFilters(props.rows, props.columns);
  const controls = useAdminTableControls(
    filters.filteredRows,
    props.columns,
    autoRows,
  );
  const visibility = useColumnVisibility(
    props.storageKey,
    props.columns,
    DEFAULT_HIDDEN_COLUMNS,
  );

  const toggleFilter = (key: string, value: string) => {
    controls.setPage(1);
    filters.toggle(key, value);
  };
  const clearFilters = () => {
    controls.setPage(1);
    filters.clear();
  };

  const handleAdd = async (names: string[]) => {
    const ok = await props.add(names);
    if (ok) controls.setPage(1);
    return ok;
  };

  return (
    <div className="space-y-4">
      <QuickAddBar placeholder={props.addPlaceholder} onAdd={handleAdd}>
        {props.addControls}
      </QuickAddBar>
      <AdminTableToolbar
        search={controls.search}
        onSearch={controls.setSearch}
        suggestions={controls.suggestions}
        filters={filters}
        onToggleFilter={toggleFilter}
        onClearFilters={clearFilters}
        columns={props.columns}
        hiddenSet={visibility.hiddenSet}
        onToggleColumn={visibility.toggle}
        actions={props.toolbarActions}
      />
      {props.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div ref={tableRef} className="space-y-4">
          <EditableDataTable
            storageKey={props.storageKey}
            columns={visibility.visibleColumns}
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
            pageSizeChoice={controls.pageSizeChoice}
            totalRows={controls.totalRows}
            totalPages={controls.totalPages}
            onPageChange={controls.setPage}
            onPageSizeChange={controls.setPageSize}
          />
        </div>
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
