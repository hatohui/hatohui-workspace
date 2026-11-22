import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label, cn } from '@hatohui/ui';
import { Sparkles } from 'lucide-react';
import { CHIP_BASE, CHIP_IDLE, CHIP_SELECTED } from '../../constants/chips';
import { SPECIAL_ICONS } from '../../constants/travel';
import { useTagOptions } from '../../hooks/useTagOptions';

interface Props {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
}

function SpecialTagsInput({ id, value, onChange }: Props) {
  const { t } = useTranslation();
  const tags = useTagOptions();
  const [draft, setDraft] = useState('');

  const options = [
    ...tags.specialKeys,
    ...value.filter((key) => !tags.specialKeys.includes(key)),
  ];

  const toggle = (key: string) =>
    onChange(
      value.includes(key)
        ? value.filter((item) => item !== key)
        : [...value, key],
    );

  const addDraft = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const key = tags.toKey(trimmed, 'SPECIAL');
    if (!value.includes(key)) onChange([...value, key]);
    setDraft('');
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{t('form.specials')}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((key) => {
          const isOn = value.includes(key);
          const Icon = SPECIAL_ICONS[key] ?? Sparkles;
          const label = tags.labelOf(key);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isOn}
              onClick={() => toggle(key)}
              className={cn(CHIP_BASE, isOn ? CHIP_SELECTED : CHIP_IDLE)}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 sm:max-w-sm">
        <Input
          id={id}
          value={draft}
          placeholder={t('form.specialsPlaceholder')}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey) {
              event.preventDefault();
              addDraft();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0"
          disabled={!draft.trim()}
          onClick={addDraft}
        >
          {t('form.addSpecial')}
        </Button>
      </div>
    </div>
  );
}

export default SpecialTagsInput;
