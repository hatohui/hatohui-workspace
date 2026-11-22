import { useState, type FormEvent } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useToast } from '@hatohui/ui';
import { useErrorMessage } from './useErrorMessage';
import { useInvalidateTravel } from './useInvalidateTravel';

interface NamedValues {
  name: string;
}

export function useEntityForm<T extends NamedValues>(
  initial: T,
  persist: (
    values: T,
    report: (message: string, progress?: number) => void,
  ) => Promise<unknown>,
  onSaved: () => void,
  applyOptimistic?: (values: T) => () => void,
) {
  const { t } = useTranslation();
  const [values, setValues] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const invalidate = useInvalidateTravel();
  const toast = useToast();
  const errorMessage = useErrorMessage();

  const set = <K extends keyof T>(key: K, value: T[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const saveInBackground = async (submitted: T, rollback: () => void) => {
    const toastId = toast.loading(
      t('form.savingItem', { name: submitted.name }),
      0.35,
    );
    const report = (message: string, progress?: number) =>
      toast.update(toastId, message, 'loading', progress);

    try {
      await persist(submitted, report);
      toast.update(toastId, t('form.refreshingCatalog'), 'loading', 0.85);
      await invalidate();
      toast.update(
        toastId,
        t('form.savedItem', { name: submitted.name }),
        'success',
      );
    } catch (error) {
      rollback();
      toast.update(toastId, errorMessage(error), 'error');
      void invalidate();
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (applyOptimistic) {
      const rollback = applyOptimistic(values);
      onSaved();
      void saveInBackground(values, rollback);
      return;
    }
    setIsSaving(true);
    try {
      await persist(values, () => {});
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
