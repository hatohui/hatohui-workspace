'use client';

import { useMemo } from 'react';
import {
  useCommissionQueue as useCommissionQueueQuery,
  type CommissionQueueItemDto,
  type QueueStage,
} from '@hatohui/models';

export interface QueueStageGroup {
  key: string;
  stage: QueueStage;
  items: CommissionQueueItemDto[];
}

export function useCommissionQueue(artistId: string) {
  const query = useCommissionQueueQuery({ artistId });
  const items = useMemo(() => query.data?.data.items ?? [], [query.data]);
  const groups = useMemo(
    () =>
      items.reduce<QueueStageGroup[]>((acc, item) => {
        const last = acc.at(-1);
        if (last?.stage === item.stage) last.items.push(item);
        else acc.push({ key: item.id, stage: item.stage, items: [item] });
        return acc;
      }, []),
    [items],
  );
  const revealKey = items.map((item) => item.id).join(',');

  return {
    items,
    groups,
    revealKey,
    isLoading: query.isPending,
  };
}
