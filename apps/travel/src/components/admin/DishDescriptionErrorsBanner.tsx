import { useTranslation } from '@hatohui/i18n';
import type { TravelDishDescriptionErrorDto } from '@hatohui/models';
import { Button, Spinner } from '@hatohui/ui';
import { AlertCircle, Sparkles, X } from 'lucide-react';

interface Props {
  errors: TravelDishDescriptionErrorDto[];
  busy: boolean;
  retryingIds: Set<string>;
  onRetry: (dishId: string) => void;
  onDismiss: () => void;
}

function DishDescriptionErrorsBanner({
  errors,
  busy,
  retryingIds,
  onRetry,
  onDismiss,
}: Props) {
  const { t } = useTranslation();

  if (errors.length === 0) return null;

  return (
    <div className="border-destructive/40 bg-destructive/10 flex flex-col gap-2 rounded-2xl border p-3.5 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="text-destructive flex items-center gap-2 font-semibold">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {t('admin.descriptionBatchErrorsTitle', { count: errors.length })}
        </div>
        {!busy && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground size-7 rounded-full p-0"
            aria-label={t('admin.dismissDescriptionErrors')}
            onClick={onDismiss}
          >
            <X className="size-4" aria-hidden />
          </Button>
        )}
      </div>
      <ul className="flex max-h-48 flex-col gap-1.5 overflow-y-auto text-xs">
        {errors.map((err) => {
          const isRetrying = retryingIds.has(err.id);
          return (
            <li
              key={err.id}
              className="text-foreground flex items-center justify-between gap-2"
            >
              <span className="min-w-0">
                <span className="font-semibold">{err.name}:</span>{' '}
                <span className="text-muted-foreground">{err.error}</span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 shrink-0 gap-1.5 rounded-full px-2.5 text-xs"
                disabled={busy || isRetrying}
                onClick={() => onRetry(err.id)}
              >
                {isRetrying ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <Sparkles className="size-3.5" aria-hidden />
                )}
                {t('admin.retryDescription')}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default DishDescriptionErrorsBanner;
