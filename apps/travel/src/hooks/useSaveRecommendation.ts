import {
  useCreateTravelRecommendation,
  useUpdateTravelRecommendation,
  type TravelRecommendationDto,
} from '@hatohui/models';
import { useToast } from '@hatohui/ui';
import type { RecommendationFields } from './useRecommendationFields';
import { useErrorMessage } from './useErrorMessage';
import { useInvalidateTravel } from './useInvalidateTravel';

interface Matches {
  dishId?: string;
  placeId?: string;
}

const detailsOf = (fields: RecommendationFields, imageKeys: string[]) => ({
  note: fields.note,
  estimate: fields.estimate === '' ? null : Number(fields.estimate),
  currency: fields.currency,
  spicy: fields.spicy,
  vegetarian: fields.vegetarian,
  imageKeys,
});

export function useSaveRecommendation(
  existing: TravelRecommendationDto | undefined,
  onSaved: () => void,
) {
  const create = useCreateTravelRecommendation();
  const update = useUpdateTravelRecommendation();
  const invalidate = useInvalidateTravel();
  const toast = useToast();
  const errorMessage = useErrorMessage();

  const save = async (
    fields: RecommendationFields,
    matches: Matches,
    imageKeys: string[],
  ) => {
    try {
      if (existing) {
        await update.mutateAsync({
          id: existing.id,
          data: detailsOf(fields, imageKeys),
        });
      } else {
        await create.mutateAsync({
          data: {
            ...detailsOf(fields, imageKeys),
            dishId: matches.dishId,
            dishName: matches.dishId ? undefined : fields.dishName,
            cuisine: fields.cuisine || undefined,
            placeId: matches.placeId,
            placeName: matches.placeId ? undefined : fields.placeName,
            placeMapsUrl: fields.mapsUrl || undefined,
          },
        });
      }
      await invalidate();
      onSaved();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return { save, isSaving: create.isPending || update.isPending };
}
