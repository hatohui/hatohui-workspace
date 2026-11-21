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

const toAmount = (value: string) => (value === '' ? null : Number(value));

const detailsOf = (fields: RecommendationFields, imageKeys: string[]) => {
  const isRange = fields.priceMode === 'range';
  return {
    note: fields.note,
    priceMin: isRange ? toAmount(fields.priceMin) : null,
    priceMax: isRange ? toAmount(fields.priceMax || fields.priceMin) : null,
    priceLevel: isRange ? null : fields.priceLevel,
    currency: fields.currency,
    spiceLevel: fields.spiceLevel,
    diets: fields.diets,
    allergens: fields.allergens,
    imageKeys,
  };
};

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
            cuisines: matches.dishId ? undefined : fields.cuisines,
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
