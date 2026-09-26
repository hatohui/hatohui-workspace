'use client';

import Link from 'next/link';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button, ConfirmDialog, Skeleton } from '@hatohui/ui';
import { useProjectEditor } from '@/hooks/useProjectEditor';
import { ImageViewer } from '@/components/shared/ImageViewer';
import { ProjectArtworkGrid } from './ProjectArtworkGrid';
import { ProjectEditorFields } from './ProjectEditorFields';
import { AddArtDialog } from './AddArtDialog';

export function ProjectEditor({ id }: { id: string }) {
  const { t } = useTranslation('art');
  const editor = useProjectEditor(id);
  const { project } = editor;

  if (editor.isLoading || !project) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <Link
        href={editor.backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t('projects.backToProjects')}
      </Link>

      <ProjectEditorFields
        key={project.updatedAt}
        project={project}
        editor={editor}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-medium">
            {t('projects.pieces', { count: project.artworkCount })}
          </h2>
          <Button onClick={() => editor.setIsAdding(true)}>
            <ImagePlus className="size-4" aria-hidden />
            {t('projects.addArt')}
          </Button>
        </div>
        {project.artworks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            {t('projects.noArtYet')}
          </p>
        ) : (
          <ProjectArtworkGrid
            artworks={project.artworks}
            alt={project.title}
            onView={editor.view}
            onRemove={editor.removeArtwork}
          />
        )}
      </section>

      <AddArtDialog
        projectId={project.id}
        existingAssetIds={editor.linkedAssetIds}
        open={editor.isAdding}
        onOpenChange={editor.setIsAdding}
      />
      <ImageViewer
        src={editor.viewing}
        alt={project.title}
        onClose={() => editor.view(null)}
      />
      <ConfirmDialog
        open={editor.isConfirmingDelete}
        title={t('projects.deleteTitle')}
        description={t('projects.deleteBody')}
        cancelLabel={t('projects.cancel')}
        confirmLabel={t('projects.delete')}
        onCancel={() => editor.setIsConfirmingDelete(false)}
        onConfirm={() => void editor.confirmDelete()}
      />
    </div>
  );
}
