import { useTranslation } from '@hatohui/i18n';
import {
  ImageViewer as SharedImageViewer,
  type ImageViewerCaption,
} from '@hatohui/ui';

interface Props {
  src: string | null;
  alt: string;
  caption?: ImageViewerCaption;
  originalUrl?: string | null;
  onPrevious?: () => void;
  onNext?: () => void;
  onClose: () => void;
}

function ImageViewer(props: Props) {
  const { t } = useTranslation('common');

  return (
    <SharedImageViewer
      {...props}
      labels={{
        zoomIn: t('imageViewer.zoomIn'),
        zoomOut: t('imageViewer.zoomOut'),
        reset: t('imageViewer.reset'),
        close: t('imageViewer.close'),
        download: t('imageViewer.download'),
        toggleCaption: t('imageViewer.toggleCaption'),
        openDetails: t('imageViewer.openDetails'),
        previous: t('imageViewer.previous'),
        next: t('imageViewer.next'),
      }}
    />
  );
}

export default ImageViewer;
