import { useMemo, useState } from 'react';
import {
  getTravelRecommendationsQueryKey,
  useDeleteTravelRecommendation,
  useTravelRecommendations,
  type TravelRecommendationDto,
} from '@hatohui/models';
import { useAdminAction } from './useAdminAction';
import { useDialogState } from './useDialogState';
import { useRowDeletion } from './useRowDeletion';
import type { SearchSuggestion } from './useSearchSuggest';

export interface AdminRecommendationRow {
  id: string;
  name: string;
  recommendation: TravelRecommendationDto;
}

export function useAdminRecommendations() {
  const query = useTravelRecommendations();
  const remove = useDeleteTravelRecommendation();
  const { run } = useAdminAction();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<TravelRecommendationDto | null>(null);
  const editDialog = useDialogState();

  const items = useMemo(() => query.data?.data ?? [], [query.data?.data]);
  const q = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return items;
    return items.filter((rec) =>
      [
        rec.dish.name,
        rec.place.name,
        rec.place.area?.name,
        rec.note,
        ...rec.dish.cuisines,
      ]
        .filter(Boolean)
        .some((text) => text.toLowerCase().includes(q)),
    );
  }, [items, q]);

  const suggestions = useMemo<SearchSuggestion[]>(
    () =>
      items.map((rec) => ({
        id: rec.id,
        label: rec.dish.name,
        sublabel: [rec.place.name, rec.place.area?.name]
          .filter(Boolean)
          .join(' · '),
        imageUrl: rec.images[0]?.url ?? rec.dish.imageUrl ?? null,
      })),
    [items],
  );

  const queryKey = getTravelRecommendationsQueryKey();
  const deletion = useRowDeletion<AdminRecommendationRow>(
    (row) =>
      run<{ data: TravelRecommendationDto[] }>(
        () => remove.mutateAsync({ id: row.id }),
        {
          queryKey,
          apply: (current) => ({
            ...current,
            data: current.data.filter((item) => item.id !== row.id),
          }),
        },
      ),
    () => true,
  );

  return {
    items: filtered,
    isLoading: query.isLoading,
    search,
    setSearch,
    suggestions,
    editing,
    editDialog,
    edit: (rec: TravelRecommendationDto) => {
      setEditing(rec);
      editDialog.show();
    },
    deletion,
  };
}
