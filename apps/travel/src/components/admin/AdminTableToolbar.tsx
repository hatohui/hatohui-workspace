import type { ReactNode } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { EditableColumn } from '@hatohui/ui';
import type { AdminColumnFilters } from '../../hooks/useAdminColumnFilters';
import type { SearchSuggestion } from '../../hooks/useSearchSuggest';
import SearchField from '../shared/SearchField';
import ActiveColumnFilters from './ActiveColumnFilters';
import ColumnFilterMenu from './ColumnFilterMenu';
import ColumnToggle from './ColumnToggle';

interface Props<T> {
  search: string;
  onSearch: (value: string) => void;
  suggestions: SearchSuggestion[];
  filters: AdminColumnFilters;
  onToggleFilter: (key: string, value: string) => void;
  onClearFilters: () => void;
  columns: EditableColumn<T>[];
  hiddenSet: Set<string>;
  onToggleColumn: (key: string) => void;
  actions?: ReactNode;
}

function AdminTableToolbar<T>(props: Props<T>) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <SearchField
          value={props.search}
          placeholder={t('admin.searchPlaceholder')}
          onChange={props.onSearch}
          suggestions={props.suggestions}
        />
        {props.actions}
        <ColumnFilterMenu
          filters={props.filters}
          onToggle={props.onToggleFilter}
        />
        <ColumnToggle
          columns={props.columns}
          hiddenSet={props.hiddenSet}
          onToggle={props.onToggleColumn}
        />
      </div>
      <ActiveColumnFilters
        filters={props.filters}
        onToggle={props.onToggleFilter}
        onClear={props.onClearFilters}
      />
    </div>
  );
}

export default AdminTableToolbar;
