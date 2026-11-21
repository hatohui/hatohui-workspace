import { useState } from 'react';
import { useToast } from '@hatohui/ui';
import { useErrorMessage } from './useErrorMessage';
import { useInvalidateTravel } from './useInvalidateTravel';

export function useConfirmedDelete(
  remove: () => Promise<unknown>,
  onDeleted?: () => void,
) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const invalidate = useInvalidateTravel();
  const toast = useToast();
  const errorMessage = useErrorMessage();

  const confirm = async () => {
    setIsDeleting(true);
    try {
      await remove();
      setOpen(false);
      onDeleted?.();
      await invalidate();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    open,
    request: () => setOpen(true),
    setOpen,
    confirm,
    isDeleting,
  };
}
