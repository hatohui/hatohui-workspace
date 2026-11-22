import type { ReactNode } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Label } from '@hatohui/ui';

interface Props {
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
}

function FieldLabel({ htmlFor, required, optional, children }: Props) {
  const { t } = useTranslation();
  return (
    <Label htmlFor={htmlFor} className="gap-1.5">
      {children}
      {required && (
        <span aria-hidden className="text-destructive">
          *
        </span>
      )}
      {optional && (
        <span className="text-xs font-normal text-muted-foreground">
          {t('form.optional')}
        </span>
      )}
    </Label>
  );
}

export default FieldLabel;
