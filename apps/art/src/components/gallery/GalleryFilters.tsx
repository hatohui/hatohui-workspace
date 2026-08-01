'use client';

import { useTranslation } from '@hatohui/i18n';
import type { AssetsSort } from '@hatohui/models';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { GALLERY_SORT_OPTIONS } from '@/constants/gallery';
import type { useGalleryAssets } from '@/hooks/useGalleryAssets';

export function GalleryFilters({
  gallery,
}: {
  gallery: ReturnType<typeof useGalleryAssets>;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="flex flex-wrap gap-3">
      <Input
        value={gallery.query}
        onChange={(event) => gallery.setQuery(event.target.value)}
        placeholder={t('gallery.searchPlaceholder')}
        className="max-w-xs"
      />
      <Select
        value={gallery.sort}
        onValueChange={(value) => gallery.setSort(value as AssetsSort)}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {GALLERY_SORT_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {t(`gallery.sort.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
