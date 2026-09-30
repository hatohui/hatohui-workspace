import { useTranslation } from '@hatohui/i18n';
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { VISIBILITY_OPTIONS, type Visibility } from './visibility';

type Props = {
  value: Visibility;
  onChange: (value: Visibility) => void;
  helperText?: string;
};

function VisibilityField({ value, onChange, helperText }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="visibility">{t('friendForm.visibilityLabel')}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as Visibility)}>
        <SelectTrigger
          id="visibility"
          className="border-input/80 bg-background font-medium text-foreground shadow-sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {VISIBILITY_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {t(`friendForm.visibilityOptions.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

export default VisibilityField;
