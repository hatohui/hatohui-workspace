import { useCallback } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useTravelTags, type TravelTagKind } from '@hatohui/models';
import type { TagSuggestion } from '@hatohui/ui';
import { TAG_KIND_NAMESPACE } from '../constants/travel';

export function useTagOptions() {
  const { t } = useTranslation();
  const query = useTravelTags();
  const tags = query.data?.data ?? [];

  const labelOf = useCallback(
    (key: string) => {
      const tag = tags.find((item) => item.key === key);
      if (tag?.name) return tag.name;
      const kind = tag?.kind ?? 'GENERAL';
      return t(`${TAG_KIND_NAMESPACE[kind]}.${key}`, { defaultValue: key });
    },
    [t, tags],
  );

  const keysOf = (kind: TravelTagKind) =>
    tags.filter((tag) => tag.kind === kind).map((tag) => tag.key);

  const suggestionsOf = (kind: TravelTagKind): TagSuggestion[] =>
    tags
      .filter((tag) => tag.kind === kind)
      .map((tag) => ({
        value: labelOf(tag.key),
        hint: String(tag.usageCount),
      }));

  const toKey = (value: string, kind: TravelTagKind): string => {
    const lower = value.trim().toLowerCase();
    const match = tags.find(
      (tag) =>
        tag.kind === kind &&
        (tag.key.toLowerCase() === lower ||
          labelOf(tag.key).toLowerCase() === lower),
    );
    return match ? match.key : value.trim();
  };

  return {
    tags,
    isLoading: query.isPending,
    labelOf,
    allergenKeys: keysOf('ALLERGEN'),
    generalKeys: keysOf('GENERAL'),
    suggestionsOf,
    toLabels: (keys: string[]) => keys.map((key) => labelOf(key)),
    toKeys: (labels: string[], kind: TravelTagKind) =>
      labels.map((label) => toKey(label, kind)),
  };
}
