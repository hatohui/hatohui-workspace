'use client';

import { useTranslation } from '@hatohui/i18n';
import { cn, Switch } from '@hatohui/ui';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ArtistCommissionTypeDto } from '@hatohui/models';
import { CommissionTypeCardBody } from './CommissionTypeCardBody';

function priceSummary(
  type: ArtistCommissionTypeDto,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string | null {
  if (!type.enabled) return null;
  if (type.startingPrice == null)
    return t('app.commissionSettings.typeNeedsPrice');
  return t('app.commissionSettings.typeFrom', {
    price: `$${Math.round(type.startingPrice / 100)}`,
  });
}

export function CommissionTypeCard({
  type,
  isFirst,
  isLast,
  onToggle,
  onMove,
}: {
  type: ArtistCommissionTypeDto;
  isFirst: boolean;
  isLast: boolean;
  onToggle: (enabled: boolean) => void;
  onMove: (direction: 'up' | 'down') => void;
}) {
  const { t } = useTranslation('art');
  const summary = priceSummary(type, t);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5',
          !type.enabled && 'bg-muted/30',
        )}
      >
        <div className="flex flex-col">
          <button
            type="button"
            disabled={isFirst}
            aria-label={t('app.commissionSettings.moveUp')}
            onClick={() => onMove('up')}
            className="cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronUp className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            disabled={isLast}
            aria-label={t('app.commissionSettings.moveDown')}
            onClick={() => onMove('down')}
            className="cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronDown className="size-4" aria-hidden />
          </button>
        </div>

        <span
          className={cn(
            'font-medium',
            !type.enabled && 'text-muted-foreground',
          )}
        >
          {type.label}
        </span>

        {summary && (
          <span
            className={cn(
              'text-sm tabular-nums',
              type.startingPrice == null
                ? 'text-destructive'
                : 'text-muted-foreground',
            )}
          >
            {summary}
          </span>
        )}

        <Switch
          className="ml-auto"
          checked={type.enabled}
          onCheckedChange={onToggle}
        />
      </div>

      {type.enabled && (
        <div className="border-t border-border p-4">
          <CommissionTypeCardBody
            commissionTypeId={type.commissionTypeId}
            typeLabel={type.label}
          />
        </div>
      )}
    </div>
  );
}
