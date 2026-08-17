import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { VIEW_MODES, type ViewMode } from '../../constants/directoryView';

type Props = {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
};

function DirectoryViewToggle({ view, onViewChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="inline-flex rounded-md border border-border p-0.5">
      {VIEW_MODES.map((mode) => (
        <Button
          key={mode}
          type="button"
          variant={view === mode ? 'default' : 'ghost'}
          size="sm"
          className="rounded-sm"
          onClick={() => onViewChange(mode)}
        >
          {t(`dashboard.viewToggle.${mode}`)}
        </Button>
      ))}
    </div>
  );
}

export default DirectoryViewToggle;
