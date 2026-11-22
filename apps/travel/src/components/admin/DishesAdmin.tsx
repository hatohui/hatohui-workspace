import { useMemo } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { ImageCropDialog } from '@hatohui/ui';
import { useAdminDishes, type DishRow } from '../../hooks/useAdminDishes';
import AdminTable from './AdminTable';
import DishThumbnailCell from './DishThumbnailCell';

function DishesAdmin() {
  const { t } = useTranslation();
  const { photo, columns: baseColumns, ...admin } = useAdminDishes();

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
