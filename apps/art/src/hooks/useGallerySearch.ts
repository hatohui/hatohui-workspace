'use client';

import { useState, type KeyboardEvent } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useGalleryTags } from '@hatohui/models';
import { GALLERY_TAG_SUGGESTION_LIMIT } from '@/constants/gallery';
import type { useGalleryAssets } from './useGalleryAssets';

type Gallery = ReturnType<typeof useGalleryAssets>;

export function useGallerySearch(gallery: Gallery) {
  const { t } = useTranslation('art');
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const tagsQuery = useGalleryTags(
    { uploadedById: gallery.artistId },
    { query: { enabled: isOpen } },
  );

  const needle = gallery.query.trim().toLowerCase();
  const suggestions = (tagsQuery.data?.data ?? [])
    .filter((tag) => tag.name !== gallery.tag)
    .filter((tag) => tag.name.toLowerCase().includes(needle))
    .slice(0, GALLERY_TAG_SUGGESTION_LIMIT)
    .map((tag) => ({
      name: tag.name,
      accent: tag.commissionTypeLabel !== null,
      hint: t('gallery.searchTagCount', { count: tag.usageCount }),
    }));

  const pick = (name: string) => {
    gallery.setTag(name);
    gallery.setQuery('');
    setIsOpen(false);
    setHighlighted(0);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setHighlighted((index) =>
        suggestions.length === 0
          ? 0
          : (index + step + suggestions.length) % suggestions.length,
      );
    } else if (event.key === 'Enter' && isOpen && suggestions[highlighted]) {
      event.preventDefault();
      pick(suggestions[highlighted].name);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'Backspace' && gallery.query === '') {
      gallery.setTag(undefined);
    }
  };

  return {
    suggestions,
    isOpen: isOpen && suggestions.length > 0,
    setIsOpen,
    highlighted,
    setHighlighted,
    pick,
    onKeyDown,
    changeQuery: (value: string) => {
      gallery.setQuery(value);
      setIsOpen(true);
      setHighlighted(0);
    },
    clearTag: () => gallery.setTag(undefined),
  };
}
