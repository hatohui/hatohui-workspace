'use client';

import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useMyCommissionOpenings,
  useCreateCommissionOpening,
  useUpdateCommissionOpening,
  useOpenCommissionOpening,
  useCloseCommissionOpening,
  useDeleteCommissionOpening,
  getMyCommissionOpeningsQueryKey,
} from '@hatohui/models';
import { OPENING_ACTIVE_STATUSES } from '@/constants/commission';

export function useCommissionOpeningsAdmin() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getMyCommissionOpeningsQueryKey(),
    });

  const listQuery = useMyCommissionOpenings();
  const create = useCreateCommissionOpening({
    mutation: { onSuccess: invalidate },
  });
  const update = useUpdateCommissionOpening({
    mutation: { onSuccess: invalidate },
  });
  const open = useOpenCommissionOpening({
    mutation: { onSuccess: invalidate },
  });
  const close = useCloseCommissionOpening({
    mutation: { onSuccess: invalidate },
  });
  const remove = useDeleteCommissionOpening({
    mutation: { onSuccess: invalidate },
  });

  const items = useMemo(() => listQuery.data?.data ?? [], [listQuery.data]);
  const active = useMemo(
    () => items.find((item) => OPENING_ACTIVE_STATUSES.includes(item.status)),
    [items],
  );
  const history = useMemo(
    () => items.filter((item) => item.id !== active?.id),
    [items, active],
  );

  return {
    items,
    active,
    history,
    isLoading: listQuery.isPending,
    create: create.mutateAsync,
    update: update.mutateAsync,
    open: (id: string) => open.mutateAsync({ id }),
    close: (id: string) => close.mutateAsync({ id }),
    remove: (id: string) => remove.mutateAsync({ id }),
  };
}
