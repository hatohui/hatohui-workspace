import { useState } from 'react';
import type { TravelRecommendationDto } from '@hatohui/models';

export function useOpenRecommendation(
  recommendations: TravelRecommendationDto[],
) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = recommendations.find((rec) => rec.id === openId) ?? null;
  return {
    open,
    show: (id: string) => setOpenId(id),
    close: () => setOpenId(null),
  };
}
