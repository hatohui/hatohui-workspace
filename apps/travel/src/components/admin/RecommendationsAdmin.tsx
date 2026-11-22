import { useTranslation } from '@hatohui/i18n';
import { EditableDataTable, Skeleton } from '@hatohui/ui';
import { useAdminRecommendations } from '../../hooks/useAdminRecommendations';
import SearchField from '../shared/SearchField';
import ColumnToggle from './ColumnToggle';
import DeleteRowDialog from './DeleteRowDialog';
import TablePagination from './TablePagination';

function RecommendationsAdmin() {
  const { t } = useTranslation();
  const admin = useAdminRecommendations();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SearchField
          value={admin.search}
          placeholder={t('admin.searchPlaceholder')}
          onChange={admin.setSearch}
          suggestions={admin.suggestions}
        />
        <ColumnToggle
          columns={admin.allColumns}
          hiddenSet={admin.hiddenColumns}
          onToggle={admin.toggleColumn}
        />
      </div>
      {admin.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <>
          <EditableDataTable
            storageKey={admin.storageKey}
            columns={admin.columns}
            rows={admin.rows}
            sortBy={admin.sortBy}
            sortDirection={admin.sortDirection}
            onSortChange={admin.onSortChange}
            onCommit={admin.commit}
            onAddRow={admin.addRow}
            addRowLabel={t('catalog.add')}
            onDeleteRow={admin.deletion.request}
            deleteRowLabel={t('recommendation.delete')}
          />
          <TablePagination
            page={admin.page}
            pageSize={admin.pageSize}
            totalRows={admin.totalRows}
            totalPages={admin.totalPages}
            onPageChange={admin.setPage}
            onPageSizeChange={admin.setPageSize}
          />
        </>
      )}
      <DeleteRowDialog
        name={admin.deletion.pending?.name ?? null}
        description={t('admin.deleteRecommendation')}
        onConfirm={() => void admin.deletion.confirm()}
        onCancel={admin.deletion.cancel}
      />
    </div>
  );
}

export default RecommendationsAdmin;
