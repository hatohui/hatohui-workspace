import { Trash2 } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import type { SocialMediaRow } from '../hooks/useSocialMediaFields';

type Props = {
  rows: SocialMediaRow[];
  onAdd: () => void;
  onRemove: (key: string) => void;
  onUpdate: (key: string, field: 'platform' | 'handle', value: string) => void;
};

function SocialMediaFieldList({ rows, onAdd, onRemove, onUpdate }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <Label>{t('friendForm.socialMediaLabel')}</Label>
      {rows.map((row) => (
        <div key={row.key} className="flex gap-2">
          <Input
            value={row.platform}
            placeholder={t('friendForm.socialMediaPlatformPlaceholder')}
            onChange={(e) => onUpdate(row.key, 'platform', e.target.value)}
          />
          <Input
            value={row.handle}
            placeholder={t('friendForm.socialMediaHandlePlaceholder')}
            onChange={(e) => onUpdate(row.key, 'handle', e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('friendForm.socialMediaRemove')}
            onClick={() => onRemove(row.key)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        {t('friendForm.socialMediaAdd')}
      </Button>
    </div>
  );
}

export default SocialMediaFieldList;
