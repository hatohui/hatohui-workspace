import { useTranslation } from '@hatohui/i18n';
import { cn, Input } from '@hatohui/ui';
import { AtSign } from 'lucide-react';
import { FIELD_OUTLINE } from '../../constants/chips';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

function CreatorFilter({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <AtSign
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground/60"
        aria-hidden
      />
      <Input
        value={value}
        placeholder={t('filters.handlePlaceholder')}
        aria-label={t('filters.addedBy')}
        onChange={(event) => onChange(event.target.value.replace(/^@/, ''))}
        className={cn('h-8 pl-8 text-xs md:text-xs', FIELD_OUTLINE)}
      />
    </div>
  );
}

export default CreatorFilter;
