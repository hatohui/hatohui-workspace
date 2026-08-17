import { useTranslation } from '@hatohui/i18n';
import { Input } from '@hatohui/ui';
import DirectoryViewToggle from './DirectoryViewToggle';
import DirectoryGroupSelect from './DirectoryGroupSelect';
import DirectorySortDirectionButton from './DirectorySortDirectionButton';
import {
  type GroupOption,
  type SortDirection,
  type ViewMode,
} from '../../constants/directoryView';

type Props = {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  search: string;
  onSearchChange: (value: string) => void;
  group: GroupOption;
  onGroupChange: (value: GroupOption) => void;
  direction: SortDirection;
  onToggleDirection: () => void;
};

function DirectoryControls({
  view,
  onViewChange,
  search,
  onSearchChange,
  group,
  onGroupChange,
  direction,
  onToggleDirection,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="mb-6 flex flex-col gap-3">
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t('dashboard.search.placeholder')}
      />
      <div className="flex items-center justify-between gap-3">
        <DirectoryViewToggle view={view} onViewChange={onViewChange} />
        {view === 'timeline' && (
          <div className="flex items-center gap-2">
            <DirectoryGroupSelect group={group} onGroupChange={onGroupChange} />
            {group !== 'none' && (
              <DirectorySortDirectionButton
                direction={direction}
                onToggle={onToggleDirection}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DirectoryControls;
