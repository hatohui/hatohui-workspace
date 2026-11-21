import { useState, type FormEvent } from 'react';
import { useToast } from '@hatohui/ui';
import { useErrorMessage } from './useErrorMessage';
import { useInvalidateTravel } from './useInvalidateTravel';

export function useEntityForm<T extends Record<string, string>>(
  initial: T,
  persist: (values: T) => Promise<unknown>,
  onSaved: () => void,
) {
  const [values, setValues] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const invalidate = useInvalidateTravel();
  const toast = useToast();
  const errorMessage = useErrorMessage();

  const set = (key: keyof T, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await persist(values);
      await invalidate();
      onSaved();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return { values, set, submit, isSaving };
}
