import { useMemo, useRef, useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  ApiError,
  getTravelDishesQueryKey,
  useBulkCreateTravelDishes,
  useDeleteTravelDish,
  useGenerateTravelDishDescriptions,
  useStartTravelDishDescriptionBatch,
  useTravelDishes,
  useUpdateTravelDish,
  type TravelDishDto,
} from '@hatohui/models';
import { useToast, type EditableColumn } from '@hatohui/ui';
import { CUISINE_LIST_SEPARATOR } from '../constants/admin';
import {
  CONFLICT_STATUS,
  MAX_CATEGORIES,
  MAX_CUISINES,
} from '../constants/travel';
import { formatAddedDate } from '../lib/formatDate';
import { useAdminAction } from './useAdminAction';
import { useAdminDishPhotos } from './useAdminDishPhotos';
import { useCuisineSuggestions } from './useCuisineSuggestions';
import { useDishDescriptionJobs } from './useDishDescriptionJobs';
import { useErrorMessage } from './useErrorMessage';
import { useFoodCategorySuggestions } from './useFoodCategorySuggestions';
import { useInvalidateTravel } from './useInvalidateTravel';
import { useRowDeletion } from './useRowDeletion';

export interface DishRow {
  id: string;
  thumbnailUrl: string | null;
  name: string;
  cuisines: string;
  categories: string;
  description: string;
  placeCount: number;
  createdAt: string;
}

const toTagList = (value: string) =>
  value
    .split(CUISINE_LIST_SEPARATOR)
    .map((name) => name.trim())
    .filter(Boolean);

export function useAdminDishes() {
  const { t } = useTranslation();
  const query = useTravelDishes();
  const update = useUpdateTravelDish();
  const remove = useDeleteTravelDish();
  const bulk = useBulkCreateTravelDishes();
  const startBatch = useStartTravelDishDescriptionBatch();
  const generateSingle = useGenerateTravelDishDescriptions();
  const suggestions = useCuisineSuggestions();
  const categorySuggestions = useFoodCategorySuggestions();
  const { run, runBulk } = useAdminAction();
  const photo = useAdminDishPhotos(run);
  const toast = useToast();
  const errorMessage = useErrorMessage();
  const invalidate = useInvalidateTravel();

  const [startingBatch, setStartingBatch] = useState(false);
  const [dismissedBatchId, setDismissedBatchId] = useState<string | null>(null);
  const [retryingIds, setRetryingIds] = useState<string[]>([]);
  const toastIdRef = useRef<number | null>(null);

  const jobs = useDishDescriptionJobs({
    onBatchProgress: (batch) => {
      void invalidate();
      if (toastIdRef.current !== null && batch.total > 0) {
        toast.update(
          toastIdRef.current,
          t('admin.generatingDescriptionsProgress', {
            done: batch.done,
            total: batch.total,
          }),
          'loading',
          Math.min(0.95, Math.max(0.05, batch.done / batch.total)),
        );
      }
    },
    onBatchSettled: (batch) => {
      void invalidate();
      const updated = Math.max(0, batch.total - batch.failed);
      const activeToastId = toastIdRef.current;
      toastIdRef.current = null;

      if (batch.total > 0 && batch.failed === batch.total) {
        const msg = t('admin.generateDescriptionsFailed');
        if (activeToastId !== null) toast.update(activeToastId, msg, 'error');
        else toast.error(msg);
      } else if (batch.failed > 0) {
        const msg = t('admin.generatedDescriptionsPartial', {
          updated,
          failed: batch.failed,
        });
        if (activeToastId !== null) toast.update(activeToastId, msg, 'info');
        else toast.info(msg);
      } else {
        const msg = t('admin.generatedDescriptions', { updated });
        if (activeToastId !== null) toast.update(activeToastId, msg, 'success');
        else toast.success(msg);
      }
    },
  });

  const rows: DishRow[] = (query.data?.data ?? []).map((dish) => ({
    id: dish.id,
    thumbnailUrl: dish.thumbnailUrl ?? dish.imageUrl ?? null,
    name: dish.name,
    cuisines: dish.cuisines.join(`${CUISINE_LIST_SEPARATOR} `),
    categories: dish.categories.join(`${CUISINE_LIST_SEPARATOR} `),
    description: dish.description ?? '',
    placeCount: dish.placeCount,
    createdAt: dish.createdAt,
  }));

  const missingDescriptionCount = rows.filter(
    (row) => !row.description.trim(),
  ).length;
  const isGeneratingDescriptions = jobs.batch !== null || startingBatch;
  const retryingDescriptionIds = useMemo(
    () => new Set(retryingIds),
    [retryingIds],
  );

  const descriptionErrors = jobs.batch?.errors.length
    ? jobs.batch.errors
    : jobs.lastBatchErrors && jobs.lastBatchErrors.batchId !== dismissedBatchId
      ? jobs.lastBatchErrors.errors
      : [];

  const generateDescriptions = async () => {
    if (isGeneratingDescriptions || missingDescriptionCount === 0) return;

    setStartingBatch(true);
    try {
      const { data: batch } = await startBatch.mutateAsync({ data: {} });
      setDismissedBatchId(null);
      if (batch.total === 0) {
        toast.info(t('admin.noMissingDescriptions'));
        return;
      }
      toastIdRef.current = toast.loading(
        t('admin.generatingDescriptionsProgress', {
          done: batch.done,
          total: batch.total,
        }),
        0.05,
      );
      jobs.watchBatch(batch);
    } catch (error) {
      if (error instanceof ApiError && error.status === CONFLICT_STATUS) {
        toast.info(t('admin.descriptionBatchRunning'));
        void jobs.refreshJobs();
      } else {
        toast.error(errorMessage(error));
      }
    } finally {
      setStartingBatch(false);
    }
  };

  const retryDishDescription = async (dishId: string) => {
    if (isGeneratingDescriptions || retryingDescriptionIds.has(dishId)) return;

    setRetryingIds((prev) => [...prev, dishId]);
    try {
      const { data } = await generateSingle.mutateAsync({
        data: { dishIds: [dishId] },
      });
      await Promise.all([invalidate(), jobs.refreshJobs()]);
      const failure = data.errors[0];
      if (!failure && data.updated > 0) {
        toast.success(t('admin.generatedDescriptions', { updated: 1 }));
      } else {
        toast.error(failure?.error ?? t('admin.generateDescriptionsFailed'));
      }
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setRetryingIds((prev) => prev.filter((id) => id !== dishId));
    }
  };

  const dismissDescriptionErrors = () => {
    if (jobs.lastBatchErrors) {
      setDismissedBatchId(jobs.lastBatchErrors.batchId);
    }
  };

  const columns: EditableColumn<DishRow>[] = [
    {
      key: 'thumbnailUrl',
      label: t('admin.photo'),
      fixed: true,
      size: 76,
    },
    {
      key: 'name',
      label: t('admin.name'),
      editable: true,
      sortable: true,
      size: 200,
    },
    {
      key: 'categories',
      label: t('admin.categories'),
      editable: true,
      sortable: true,
      suggestions: categorySuggestions,
      maxTags: MAX_CATEGORIES,
      selectPlaceholder: t('form.foodCategoriesPlaceholder'),
      createLabel: (tag) => t('form.categoryCreate', { tag }),
      removeLabel: (tag) => t('form.categoryRemove', { tag }),
      size: 200,
    },
    {
      key: 'cuisines',
      label: t('form.cuisines'),
      editable: true,
      sortable: true,
      suggestions,
      maxTags: MAX_CUISINES,
      selectPlaceholder: t('form.cuisinesPlaceholder'),
      createLabel: (tag) => t('form.cuisineCreate', { tag }),
      removeLabel: (tag) => t('form.cuisineRemove', { tag }),
      size: 200,
    },
    {
      key: 'description',
      label: t('dishes.description'),
      editable: true,
      sortable: true,
      size: 280,
    },
    {
      key: 'placeCount',
      label: t('admin.places'),
      sortable: true,
      size: 90,
    },
    {
      key: 'createdAt',
      label: t('admin.added'),
      sortable: true,
      render: (row) => formatAddedDate(row.createdAt),
      size: 130,
    },
  ];

  const dishesQueryKey = getTravelDishesQueryKey();

  const commit = (id: string, key: keyof DishRow, value: string) => {
    const patch =
      key === 'cuisines' || key === 'categories'
        ? { [key]: toTagList(value) }
        : { [key]: value };
    void run<{ data: TravelDishDto[] }>(
      () => update.mutateAsync({ id, data: patch }),
      {
        queryKey: dishesQueryKey,
        apply: (current) => ({
          ...current,
          data: current.data.map((dish) =>
            dish.id === id ? { ...dish, ...patch } : dish,
          ),
        }),
      },
    );
  };

  const deletion = useRowDeletion<DishRow>(
    (row) =>
      run<{ data: TravelDishDto[] }>(() => remove.mutateAsync({ id: row.id }), {
        queryKey: dishesQueryKey,
        apply: (current) => ({
          ...current,
          data: current.data.filter((dish) => dish.id !== row.id),
        }),
      }),
    (row) => row.placeCount > 0,
  );

  return {
    rows,
    columns,
    isLoading: query.isLoading,
    deletion,
    commit,
    add: (names: string[]) =>
      runBulk(() => bulk.mutateAsync({ data: { names } })),
    photo,
    missingDescriptionCount,
    isGeneratingDescriptions,
    descriptionBatch: jobs.batch,
    descriptionErrors,
    retryingDescriptionIds,
    generateDescriptions,
    retryDishDescription,
    dismissDescriptionErrors,
  };
}
