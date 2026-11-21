import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';

function ClearFiltersButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      {t('catalog.clearFilters')}
    </Button>
  );
}

export default ClearFiltersButton;
