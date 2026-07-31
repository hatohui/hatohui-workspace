import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Checkbox, Input, Label } from '@hatohui/ui';
import { useConnectionsSearch } from '../../hooks/useConnectionsSearch';

type Props = {
  onSubmit: (birthdayDetailsIds: string[]) => void;
  submitting: boolean;
};

function OnboardingConnectionsStep({ onSubmit, submitting }: Props) {
  const { t } = useTranslation();
  const search = useConnectionsSearch();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalPages = Math.max(1, Math.ceil(search.total / search.pageSize));

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">{t('onboarding.connections.title')}</h2>
      <Input
        value={search.query}
        onChange={(e) => search.setQuery(e.target.value)}
        placeholder={t('onboarding.connections.searchPlaceholder')}
      />
      <div className="flex flex-col gap-2">
        {!search.isLoading && search.items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t('onboarding.connections.empty')}
          </p>
        )}
        {search.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Checkbox
              id={`connection-${item.id}`}
              checked={selected.has(item.id)}
              onCheckedChange={() => toggle(item.id)}
            />
            <Label htmlFor={`connection-${item.id}`}>{item.name}</Label>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={search.page <= 1}
            onClick={() => search.setPage(search.page - 1)}
          >
            {t('onboarding.back')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={search.page >= totalPages}
            onClick={() => search.setPage(search.page + 1)}
          >
            {t('onboarding.next')}
          </Button>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        {t('onboarding.connections.selectedCount', { count: selected.size })}
      </p>
      <Button
        disabled={submitting}
        className="w-fit"
        onClick={() => onSubmit(Array.from(selected))}
      >
        {t('onboarding.next')}
      </Button>
    </div>
  );
}

export default OnboardingConnectionsStep;
