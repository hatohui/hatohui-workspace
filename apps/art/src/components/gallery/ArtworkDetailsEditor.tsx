'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import type { AssetDto } from '@hatohui/models';
import { useArtworkDetailsEditor } from '@/hooks/useArtworkDetailsEditor';
import { AssetDetailsFields } from './AssetDetailsFields';

export function ArtworkDetailsEditor({ asset }: { asset: AssetDto }) {
  const { t } = useTranslation('art');
  const editor = useArtworkDetailsEditor(asset);

  return (
    <form
      className="space-y-3 rounded-xl border border-border p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void editor.save();
      }}
    >
      <AssetDetailsFields
        idPrefix={asset.id}
        details={editor.details}
        onChange={editor.setDetails}
      />
      {editor.hasError && (
        <p className="text-xs text-destructive" role="alert">
          {t('gallery.details.saveFailed')}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!editor.isDirty || editor.isSaving}
          onClick={editor.discard}
        >
          {t('gallery.details.discard')}
        </Button>
        <Button type="submit" disabled={!editor.isDirty || editor.isSaving}>
          {editor.isSaving
            ? t('gallery.details.saving')
            : t('gallery.details.save')}
        </Button>
      </div>
    </form>
  );
}
