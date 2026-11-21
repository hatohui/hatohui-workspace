import { useCallback } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useTravelTags, type TravelTagKind } from '@hatohui/models';
import { TAG_KIND_NAMESPACE } from '../constants/travel';

export function useTagOptions() {
  const { t } = useTranslation();
  const tags = useTravelTags().data?.data ?? [];

  const labelOf = useCallback(
    (key: string) => {
      const tag = tags.find((item) => item.key === key);
      if (tag?.name) return tag.name;
      const kind = tag?.kind ?? 'DIET';
      return t(`${TAG_KIND_NAMESPACE[kind]}.${key}`, { defaultValue: key });
    },
    [t, tags],
  );

  const keysOf = (kind: TravelTagKind) =>
    tags.filter((tag) => tag.kind === kind).map((tag) => tag.key);

  return {
    tags,
    labelOf,
    dietKeys: keysOf('DIET'),
    allergenKeys: keysOf('ALLERGEN'),
  };
}
