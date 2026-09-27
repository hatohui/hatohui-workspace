'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, Label, TagInput } from '@hatohui/ui';
import type { AssetDto } from '@hatohui/models';
import { useAssetEditor } from '@/hooks/useAssetEditor';
import { useUploadTagSuggestions } from '@/hooks/useUploadTagSuggestions';
import { AssetDetailsFields } from './AssetDetailsFields';

export function AssetEditForm({
  asset,
  onClose,
}: {
  asset: AssetDto;
  onClose: () => void;
}) {
  const { t } = useTranslation('art');
  const editor = useAssetEditor(asset, onClose);
  const suggestions = useUploadTagSuggestions(true);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void editor.save();
      }}
    >
      <AssetDetailsFields
        idPrefix={`edit-${asset.id}`}
        details={editor.details}
        onChange={editor.setDetails}
      />
      <div className="space-y-1.5">
        <Label htmlFor={`edit-${asset.id}-tags`}>
          {t('gallery.details.tagsLabel')}
        </Label>
        <TagInput
          id={`edit-${asset.id}-tags`}
          value={editor.tags}
          onChange={editor.setTags}
          suggestions={suggestions}
          placeholder={t('gallery.upload.tagsPlaceholder')}
          createLabel={(tag) => t('gallery.upload.tagCreate', { tag })}
          removeLabel={(tag) => t('gallery.upload.tagRemove', { tag })}
        />
      </div>
      {editor.hasError && (
        <p className="text-xs text-destructive" role="alert">
          {t('gallery.details.saveFailed')}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {t('gallery.upload.cancel')}
        </Button>
        <Button type="submit" disabled={editor.isSaving}>
          {editor.isSaving
            ? t('gallery.details.saving')
            : t('gallery.details.save')}
        </Button>
      </div>
    </form>
  );
}
