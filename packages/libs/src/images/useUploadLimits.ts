import {
  useImageUploadLimits,
  type ImageUploadLimitsDto,
} from '@hatohui/models';

export function useUploadLimits(): ImageUploadLimitsDto | undefined {
  const query = useImageUploadLimits({
    query: { staleTime: Number.POSITIVE_INFINITY },
  });
  return query.data?.data;
}
