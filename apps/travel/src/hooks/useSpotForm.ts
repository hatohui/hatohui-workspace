import { useState, type FormEvent } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  useCreateTravelSpot,
  useUpdateTravelSpot,
  type TravelSpotDto,
} from '@hatohui/models';
import { useToast } from '@hatohui/ui';
import { useErrorMessage } from './useErrorMessage';
import { useHasAreas } from './useHasAreas';
import { useInvalidateTravel } from './useInvalidateTravel';
import { usePhotoList } from './usePhotoList';
import { useTravelLocation } from './useTravelLocation';

export interface SpotFormValues {
  name: string;
  areaId: string;
  categories: string[];
  address: string;
  mapsUrl: string;
  note: string;
  specials: string[];
  tags: string[];
}

export function useSpotForm(
  spot: TravelSpotDto | undefined,
  onSaved: () => void,
) {
  const { t } = useTranslation();
  const location = useTravelLocation();
  const create = useCreateTravelSpot();
  const update = useUpdateTravelSpot();
  const hasAreas = useHasAreas();
  const photos = usePhotoList(spot?.images ?? []);
  const invalidate = useInvalidateTravel();
  const toast = useToast();
  const errorMessage = useErrorMessage();

  const [values, setValues] = useState<SpotFormValues>(() => ({
    name: spot?.name ?? '',
    areaId: spot?.area?.id ?? location.area?.id ?? '',
    categories: spot?.categories ?? [],
    address: spot?.address ?? '',
    mapsUrl: spot?.mapsUrl ?? '',
    note: spot?.note ?? '',
    specials: spot?.specials ?? [],
    tags: spot?.tags ?? [],
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = <K extends keyof SpotFormValues>(
    key: K,
    value: SpotFormValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const isSaving =
    isSubmitting || photos.isUploading || create.isPending || update.isPending;
  const canSubmit =
    !isSaving &&
    values.name.trim() !== '' &&
    (!hasAreas || values.areaId !== '');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    const trimmedName = values.name.trim();
    const toastId = toast.loading(
      t('form.savingItem', { name: trimmedName }),
      0.2,
    );

    try {
      const imageKeys = await photos.uploadPending();
      if (!imageKeys) {
        toast.dismiss(toastId);
        return;
      }

      const payload = {
        name: trimmedName,
        areaId: values.areaId,
        categories: values.categories,
        address: values.address.trim() || undefined,
        mapsUrl: values.mapsUrl.trim() || undefined,
        note: values.note.trim() || undefined,
        specials: values.specials,
        tags: values.tags,
        imageKeys,
      };

      toast.update(
        toastId,
        t('form.savingItem', { name: trimmedName }),
        'loading',
        0.65,
      );

      if (spot) {
        await update.mutateAsync({ id: spot.id, data: payload });
      } else {
        await create.mutateAsync({ data: payload });
      }

      toast.update(toastId, t('form.refreshingCatalog'), 'loading', 0.85);
      await invalidate();
      toast.update(
        toastId,
        t('form.savedItem', { name: trimmedName }),
        'success',
      );
      onSaved();
    } catch (error) {
      toast.update(toastId, errorMessage(error), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    set,
    photos,
    canSubmit,
    isSaving,
    submit,
  };
}
