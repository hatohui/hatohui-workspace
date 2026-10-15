'use client';

import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { FaqItemDto } from '@hatohui/models';
import { Button, Input, Textarea } from '@hatohui/ui';
import {
  FAQ_ANSWER_MAX_LENGTH,
  FAQ_ANSWER_ROWS,
  FAQ_QUESTION_MAX_LENGTH,
} from '@/constants/faq';

export function FaqEditorRow({
  item,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
}: {
  item: FaqItemDto;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<FaqItemDto>) => void;
  onMove: (offset: number) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="space-y-2 rounded-lg border border-border p-4">
      <div className="flex items-center gap-2">
        <Input
          value={item.question}
          maxLength={FAQ_QUESTION_MAX_LENGTH}
          placeholder={t('app.faq.question')}
          aria-label={t('app.faq.question')}
          onChange={(event) => onChange({ question: event.target.value })}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('app.faq.moveUp')}
          disabled={isFirst}
          onClick={() => onMove(-1)}
        >
          <ArrowUp />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('app.faq.moveDown')}
          disabled={isLast}
          onClick={() => onMove(1)}
        >
          <ArrowDown />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('app.faq.remove')}
          onClick={onRemove}
        >
          <Trash2 />
        </Button>
      </div>
      <Textarea
        rows={FAQ_ANSWER_ROWS}
        value={item.answer}
        maxLength={FAQ_ANSWER_MAX_LENGTH}
        placeholder={t('app.faq.answer')}
        aria-label={t('app.faq.answer')}
        onChange={(event) => onChange({ answer: event.target.value })}
      />
    </div>
  );
}
