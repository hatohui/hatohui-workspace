import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input } from '@hatohui/ui';
import { useConnectionsSearch } from './useConnectionsSearch';

type Props = {
  onSubmit: (userIds: string[]) => void;
  submitting: boolean;
};

function OnboardingConnectionsStep({ onSubmit, submitting }: Props) {
  const { t } = useTranslation();
  const search = useConnectionsSearch();
  const [selected, setSelected] = useState<Map<string, string>>(new Map());

  const select = (id: string, name: string) => {
    setSelected((prev) => new Map(prev).set(id, name));
    search.setQuery('');
  };

  const remove = (id: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const suggestions = search.items.filter((item) => !selected.has(item.id));

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">{t('common:onboarding.connections.title')}</h2>

      {selected.size > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from(selected, ([id, name]) => (
            <span
              key={id}
              className="flex items-center gap-1 rounded-full bg-primary/10 py-0.5 pl-3 pr-1 text-sm text-primary"
            >
              {name}
              <button
                type="button"
                onClick={() => remove(id)}
                aria-label={t('common:onboarding.connections.removeAria', {
                  name,
                })}
                className="rounded-full p-0.5 hover:bg-primary/20"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Input
        value={search.query}
        onChange={(e) => search.setQuery(e.target.value)}
        placeholder={t('common:onboarding.connections.searchPlaceholder')}
      />
      <div className="max-h-64 overflow-y-auto rounded-md border">
        {!search.isLoading && suggestions.length === 0 && (
          <p className="p-3 text-sm text-muted-foreground">
            {t('common:onboarding.connections.empty')}
          </p>
        )}
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => select(item.id, item.name)}
            className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-accent"
          >
            {item.name}
            {item.handle && (
              <span className="text-xs text-muted-foreground">
                @{item.handle}
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {t('common:onboarding.connections.selectedCount', {
          count: selected.size,
        })}
      </p>
      <Button
        disabled={submitting}
        className="w-fit"
        onClick={() => onSubmit(Array.from(selected.keys()))}
      >
        {t('common:onboarding.next')}
      </Button>
    </div>
  );
}

export default OnboardingConnectionsStep;
