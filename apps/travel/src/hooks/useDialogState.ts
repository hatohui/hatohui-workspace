import { useState } from 'react';

export function useDialogState() {
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState(0);

  return {
    open,
    version,
    setOpen,
    show: () => {
      setVersion((v) => v + 1);
      setOpen(true);
    },
    close: () => setOpen(false),
  };
}
