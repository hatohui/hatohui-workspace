import { useState, type FormEvent } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Input } from '@hatohui/ui';
import { useAdminKey } from '../../hooks/useAdminKey';

function AdminKeyForm() {
  const { t } = useTranslation('workspace');
  const { save } = useAdminKey();
  const [value, setValue] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (value.trim()) save(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-72 flex-col gap-3">
      <label className="text-sm font-medium" htmlFor="admin-key">
        {t('adminGate.keyLabel')}
      </label>
      <Input
        id="admin-key"
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('adminGate.keyPlaceholder')}
      />
      <Button type="submit">{t('adminGate.keySubmit')}</Button>
    </form>
  );
}

export default AdminKeyForm;
