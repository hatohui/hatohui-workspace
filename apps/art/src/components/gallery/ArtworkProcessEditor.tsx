'use client';

import { ImagePlus } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { useArtworkProcessEditor } from '@/hooks/useArtworkProcessEditor';
import { ArtworkProcessEditorRow } from './ArtworkProcessEditorRow';

export function ArtworkProcessEditor({ assetId }: { assetId: string }) {
  const { t } = useTranslation('art');
  const editor = useArtworkProcessEditor(assetId);

  return (
    <section className="space-y-4 rounded-xl border border-border p-4">
      <div className="space-y-1">
        <h2 className="font-serif text-xl">{t('gallery.process.title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('gallery.process.hint')}
        </p>
      </div>
      {editor.steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('gallery.process.empty')}
        </p>
      ) : (
        <ol className="space-y-2">
          {editor.steps.map((step, index) => (
            <ArtworkProcessEditorRow
              key={step.key}
              step={step}
              index={index}
              isFirst={index === 0}
              isLast={index === editor.steps.length - 1}
              onLabelChange={(label) => editor.setLabel(index, label)}
              onMoveUp={() => editor.moveUp(index)}
              onMoveDown={() => editor.moveDown(index)}
              onRemove={() => editor.remove(index)}
            />
          ))}
        </ol>
      )}
      {editor.hasError && (
        <p className="text-xs text-destructive" role="alert">
          {t('gallery.process.saveFailed')}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm" className="cursor-pointer">
          <label>
            <ImagePlus aria-hidden />
            {editor.isUploading
              ? t('gallery.process.uploading')
              : t('gallery.process.add')}
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={editor.isUploading}
              onChange={(event) => {
                void editor.addFiles(Array.from(event.target.files ?? []));
                event.target.value = '';
              }}
            />
          </label>
        </Button>
        {editor.isDirty && (
          <Button
            type="button"
            size="sm"
            disabled={editor.isSaving || editor.isUploading}
            onClick={() => void editor.save()}
          >
            {editor.isSaving
              ? t('gallery.process.saving')
              : t('gallery.process.save')}
          </Button>
        )}
      </div>
    </section>
  );
}
