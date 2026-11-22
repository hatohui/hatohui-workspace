import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { X } from 'lucide-react';

interface Props {
  onClick: () => void;
  count?: number;
  variant?: 'outline' | 'ghost';
}

function ClearFiltersButton({ onClick, count, variant = 'outline' }: Props) {
  const { t } = useTranslation();
  return (
    <Button variant={variant} size="sm" onClick={onClick}>
      <X className="size-3.5" aria-hidden />
      {count
        ? t('catalog.clearFiltersCount', { count })
        : t('catalog.clearFilters')}
    </Button>
  );
}

export default ClearFiltersButton;
