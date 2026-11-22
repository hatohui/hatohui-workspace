import { useTranslation } from '@hatohui/i18n';
import { Spinner } from '@hatohui/ui';

function OptimisticBadge() {
  const { t } = useTranslation();
  return (
    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
      <Spinner className="size-3" />
      {t('form.saving')}
    </span>
  );
}

export default OptimisticBadge;
