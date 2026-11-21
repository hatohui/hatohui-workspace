import { useState } from 'react';

export function useRowDeletion<T extends { id: string }>(
  remove: (row: T) => Promise<boolean>,
  isInUse: (row: T) => boolean,
) {
  const [pending, setPending] = useState<T | null>(null);

  return {
    pending,
    request: (row: T) => {
      if (isInUse(row)) setPending(row);
      else void remove(row);
    },
    confirm: async () => {
      if (pending && (await remove(pending))) setPending(null);
    },
    cancel: () => setPending(null),
  };
}
