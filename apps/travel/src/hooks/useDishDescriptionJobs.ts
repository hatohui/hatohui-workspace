import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getTravelDishDescriptionJobsQueryKey,
  useTravelDishDescriptionJobs,
  type TravelDishDescriptionBatchProgressDto,
} from '@hatohui/models';

const POLL_MS = 2_000;

interface Options {
  onBatchProgress?: (batch: TravelDishDescriptionBatchProgressDto) => void;
  onBatchSettled?: (batch: TravelDishDescriptionBatchProgressDto) => void;
}

export function useDishDescriptionJobs({
  onBatchProgress,
  onBatchSettled,
}: Options = {}) {
  const qc = useQueryClient();
  const [batchStarted, setBatchStarted] = useState(false);
  const [optimisticBatch, setOptimisticBatch] =
    useState<TravelDishDescriptionBatchProgressDto | null>(null);
  const lastBatch = useRef<TravelDishDescriptionBatchProgressDto | null>(null);

  const query = useTravelDishDescriptionJobs({
    query: {
      refetchInterval: (q) =>
        batchStarted || Boolean(q.state.data?.data?.batch) ? POLL_MS : false,
    },
  });

  const data = query.data?.data;

  const callbacks = useRef({ onBatchProgress, onBatchSettled });
  callbacks.current = { onBatchProgress, onBatchSettled };

  useEffect(() => {
    if (!data) return;

    const prev = lastBatch.current;
    if (data.batch) {
      if (prev?.done !== data.batch.done) {
        callbacks.current.onBatchProgress?.(data.batch);
      }
      lastBatch.current = data.batch;
      setOptimisticBatch(null);
      setBatchStarted(false);
    } else if (prev && !batchStarted) {
      const errors =
        data.lastBatchErrors?.batchId === prev.id
          ? data.lastBatchErrors.errors
          : prev.errors;
      lastBatch.current = null;
      setOptimisticBatch(null);
      callbacks.current.onBatchSettled?.({
        ...prev,
        done: prev.total,
        failed: errors.length,
        errors,
      });
    } else if (
      prev &&
      batchStarted &&
      data.lastBatchErrors?.batchId === prev.id
    ) {
      lastBatch.current = null;
      setOptimisticBatch(null);
      setBatchStarted(false);
      callbacks.current.onBatchSettled?.({
        ...prev,
        done: prev.total,
        failed: data.lastBatchErrors.errors.length,
        errors: data.lastBatchErrors.errors,
      });
    }
  }, [data, batchStarted]);

  return {
    batch: data?.batch ?? optimisticBatch,
    lastBatchErrors: data?.lastBatchErrors ?? null,
    refreshJobs: () =>
      qc.invalidateQueries({
        queryKey: getTravelDishDescriptionJobsQueryKey(),
      }),
    watchBatch: (batch: TravelDishDescriptionBatchProgressDto) => {
      lastBatch.current = batch;
      setOptimisticBatch(batch);
      setBatchStarted(true);
      void qc.invalidateQueries({
        queryKey: getTravelDishDescriptionJobsQueryKey(),
      });
    },
  };
}
