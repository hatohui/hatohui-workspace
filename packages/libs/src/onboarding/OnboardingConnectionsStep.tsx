import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Avatar, Button, Input } from '@hatohui/ui';
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

      {/* Result list — fixed height so it never overflows the modal */}
      <div className="flex flex-col rounded-md border">
        <div className="divide-y overflow-hidden">
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
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
            >
              <Avatar
                src={item.avatarUrl}
                alt={item.name}
                className="size-8 shrink-0"
              />
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{item.name}</span>
                {item.handle && (
                  <span className="truncate text-xs text-muted-foreground">
                    @{item.handle}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Pagination row — always visible so the modal height stays stable */}
        <div className="flex items-center justify-between border-t px-2 py-1.5">
          <button
            type="button"
            disabled={search.page <= 1}
            onClick={() => search.setPage((p) => p - 1)}
            aria-label={t('common:onboarding.connections.prevPage')}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-xs text-muted-foreground">
            {t('common:onboarding.connections.pageIndicator', {
              page: search.page,
              total: search.totalPages,
            })}
          </span>
          <button
            type="button"
            disabled={search.page >= search.totalPages}
            onClick={() => search.setPage((p) => p + 1)}
            aria-label={t('common:onboarding.connections.nextPage')}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
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
