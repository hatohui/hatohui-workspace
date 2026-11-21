import type { ReactNode } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Spinner } from '@hatohui/ui';
import { Plus } from 'lucide-react';
import { useQuickAdd } from '../../hooks/useQuickAdd';

interface Props {
  placeholder: string;
  onAdd: (names: string[]) => Promise<boolean>;
  children?: ReactNode;
}

function QuickAddBar({ placeholder, onAdd, children }: Props) {
  const { t } = useTranslation();
  const quick = useQuickAdd(onAdd);

  return (
    <form
      onSubmit={(event) => void quick.submit(event)}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      {children}
      <Input
        value={quick.value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => quick.setValue(event.target.value)}
        className="h-10 flex-1"
      />
      <Button type="submit" disabled={quick.isAdding || !quick.value.trim()}>
        {quick.isAdding ? <Spinner /> : <Plus />}
        {t('admin.add')}
      </Button>
    </form>
  );
}

export default QuickAddBar;
