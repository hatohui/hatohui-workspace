'use client';

import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input } from '@hatohui/ui';
import { PROCESS_LABEL_MAX_LENGTH } from '@/constants/gallery';
import type { EditableProcessStep } from '@/hooks/useArtworkProcessEditor';

export function ArtworkProcessEditorRow({
  step,
  index,
  isFirst,
  isLast,
  onLabelChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  step: EditableProcessStep;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onLabelChange: (label: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation('art');

  return (
    <li className="flex items-center gap-3">
      <span className="w-5 text-right font-serif text-sm text-muted-foreground tabular-nums">
        {index + 1}
      </span>
      <img
        src={step.imageUrl}
        alt=""
        className="size-14 shrink-0 rounded-md bg-card object-cover"
      />
      <Input
        value={step.label}
        maxLength={PROCESS_LABEL_MAX_LENGTH}
        placeholder={t('gallery.process.labelPlaceholder')}
        aria-label={t('gallery.process.stepAlt', { label: index + 1 })}
        onChange={(event) => onLabelChange(event.target.value)}
        className="min-w-0 flex-1"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isFirst}
        aria-label={t('gallery.process.moveUp')}
        onClick={onMoveUp}
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isLast}
        aria-label={t('gallery.process.moveDown')}
        onClick={onMoveDown}
      >
        <ArrowDown />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t('gallery.process.remove')}
        onClick={onRemove}
      >
        <Trash2 />
      </Button>
    </li>
  );
}
