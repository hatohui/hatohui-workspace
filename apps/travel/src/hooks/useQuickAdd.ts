import { useState, type FormEvent } from 'react';
import { QUICK_ADD_SEPARATOR } from '../constants/admin';

export function useQuickAdd(onAdd: (names: string[]) => Promise<boolean>) {
  const [value, setValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const names = value
      .split(QUICK_ADD_SEPARATOR)
      .map((name) => name.trim())
      .filter(Boolean);
    if (!names.length || isAdding) return;
    setIsAdding(true);
    const ok = await onAdd(names);
    setIsAdding(false);
    if (ok) setValue('');
  };

  return { value, setValue, submit, isAdding };
}
