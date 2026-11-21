import { useTranslation } from '@hatohui/i18n';
import { Input } from '@hatohui/ui';
import { AtSign } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

function CreatorFilter({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <AtSign
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={value}
        placeholder={t('filters.handlePlaceholder')}
        aria-label={t('filters.addedBy')}
        onChange={(event) => onChange(event.target.value.replace(/^@/, ''))}
        className="pl-9"
      />
    </div>
  );
}

export default CreatorFilter;
