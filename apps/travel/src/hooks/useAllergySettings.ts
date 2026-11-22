import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getTravelAllergiesQueryKey,
  useUpdateTravelAllergies,
} from '@hatohui/models';
import { withTag } from '../lib/withTag';
import { useMyAllergies } from './useMyAllergies';
import { useTagOptions } from './useTagOptions';

export function useAllergySettings() {
  const queryClient = useQueryClient();
  const mine = useMyAllergies();
  const tags = useTagOptions();
  const update = useUpdateTravelAllergies();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => setSelected(mine.allergens), [mine.allergens]);

  const isDirty =
    selected.length !== mine.allergens.length ||
    selected.some((key) => !mine.allergens.includes(key));

  const save = async () => {
    await update.mutateAsync({ data: { allergens: selected } });
    await queryClient.invalidateQueries({
      queryKey: getTravelAllergiesQueryKey(),
    });
  };

  return {
    options: tags.allergenKeys,
    labelOf: tags.labelOf,
    selected,
    toggle: (key: string) =>
      setSelected((list) => withTag(list, key, !list.includes(key))),
    save,
    isDirty,
    isSaving: update.isPending,
    isLoading: mine.isLoading || tags.isLoading,
  };
}
