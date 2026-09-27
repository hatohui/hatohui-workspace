'use client';

import { PenLine } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { cn, Popover, PopoverContent, PopoverTrigger } from '@hatohui/ui';
import type { AssetDetails } from '@/hooks/useUploadQueue';
import { AssetDetailsFields } from './AssetDetailsFields';

export function UploadItemDetailsPopover({
  fileName,
  details,
  onChange,
  disabled,
}: {
  fileName: string;
  details: AssetDetails;
  onChange: (details: AssetDetails) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation('art');
  const hasDetails = Boolean(
    details.title.trim() || details.description.trim(),
  );
  const label = t('gallery.details.editTrigger', { name: fileName });

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        aria-label={label}
        title={label}
        className={cn(
          'absolute right-1 bottom-1 flex size-7 items-center justify-center rounded-full shadow-sm transition-colors disabled:opacity-50',
          hasDetails
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-background/90 text-foreground hover:bg-secondary',
        )}
      >
        <PenLine className="size-3.5" aria-hidden />
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3">
        <p className="truncate text-sm font-medium">{fileName}</p>
        <AssetDetailsFields
          idPrefix={fileName}
          details={details}
          onChange={onChange}
        />
      </PopoverContent>
    </Popover>
  );
}
