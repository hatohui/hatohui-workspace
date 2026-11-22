import { useMemo } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, ImageCropDialog, Spinner } from '@hatohui/ui';
import { Sparkles } from 'lucide-react';
import { useAdminDishes, type DishRow } from '../../hooks/useAdminDishes';
import AdminTable from './AdminTable';
import DishDescriptionErrorsBanner from './DishDescriptionErrorsBanner';
import DishThumbnailCell from './DishThumbnailCell';

function DishesAdmin() {
  const { t } = useTranslation();
  const {
    photo,
    columns: baseColumns,
    missingDescriptionCount,
    isGeneratingDescriptions,
    descriptionBatch,
    descriptionErrors,
    retryingDescriptionIds,
    generateDescriptions,
    retryDishDescription,
    dismissDescriptionErrors,
    ...admin
  } = useAdminDishes();

  const columns = useMemo(
    () =>
      baseColumns.map((column) =>
        column.key === 'thumbnailUrl'
          ? {
              ...column,
              renderCell: (row: DishRow) => (
                <DishThumbnailCell
                  name={row.name}
                  thumbnailUrl={row.thumbnailUrl}
                  isUploading={photo.isUploading(row.id)}
                  onPickFile={(file) => photo.openCrop(row.id, file)}
                  onRemove={() => void photo.removePhoto(row.id)}
                />
              ),
            }
          : column,
      ),
    [baseColumns, photo],
  );

  const generateButtonLabel = descriptionBatch
    ? t('admin.generatingDescriptionsProgress', {
        done: descriptionBatch.done,
        total: descriptionBatch.total,
      })
    : t('admin.generateDescriptions', { count: missingDescriptionCount });

  const generateButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-10 shrink-0 gap-1.5"
      disabled={isGeneratingDescriptions || missingDescriptionCount === 0}
      onClick={() => void generateDescriptions()}
    >
      {isGeneratingDescriptions ? (
        <Spinner className="size-4" />
      ) : (
        <Sparkles className="size-4" aria-hidden />
      )}
      {generateButtonLabel}
    </Button>
  );

  return (
    <>
      <AdminTable
        storageKey="travel-admin-dishes"
        addPlaceholder={t('admin.addDishes')}
        deleteDescription={t('admin.deleteDish')}
        columns={columns}
        rows={admin.rows}
        isLoading={admin.isLoading}
        deletion={admin.deletion}
        commit={admin.commit}
        add={admin.add}
        toolbarActions={generateButton}
        notice={
          <DishDescriptionErrorsBanner
            errors={descriptionErrors}
            busy={isGeneratingDescriptions}
            retryingIds={retryingDescriptionIds}
            onRetry={(dishId) => void retryDishDescription(dishId)}
            onDismiss={dismissDescriptionErrors}
          />
        }
      />
      <ImageCropDialog
        open={Boolean(photo.cropTarget)}
        file={photo.cropTarget?.file ?? null}
        aspect={4 / 3}
        aspectLabel={t('form.cropAspectDish')}
        title={t('form.cropPhoto')}
        hint={t('form.cropHint')}
        cancelLabel={t('form.cancel')}
        confirmLabel={t('form.cropApply')}
        zoomLabel={t('form.cropZoom')}
        resetLabel={t('form.cropReset')}
        fitLabel={t('form.cropFit')}
        onCancel={photo.closeCrop}
        onConfirm={(cropped) => {
          const target = photo.cropTarget;
          photo.closeCrop();
          if (target) void photo.uploadPhoto(target.dishId, cropped);
        }}
      />
    </>
  );
}

export default DishesAdmin;
