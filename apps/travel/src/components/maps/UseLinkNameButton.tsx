import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { Pencil } from 'lucide-react';

interface Props {
  name: string;
  onUse: (name: string) => void;
}

function UseLinkNameButton({ name, onUse }: Props) {
  const { t } = useTranslation();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full"
      onClick={() => onUse(name)}
    >
      <Pencil />
      {t('form.useLinkName', { name })}
    </Button>
  );
}

export default UseLinkNameButton;
