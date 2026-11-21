import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@hatohui/ui';
import RecommendationDetails from './RecommendationDetails';

interface Props {
  recommendation: TravelRecommendationDto | null;
  onClose: () => void;
}

function RecommendationSheet({ recommendation, onClose }: Props) {
  const { t } = useTranslation();
  return (
    <Sheet
      open={Boolean(recommendation)}
      onOpenChange={(open) => !open && onClose()}
    >
      <SheetContent closeLabel={t('common:back')}>
        <SheetHeader className="sr-only">
          <SheetTitle>{recommendation?.dish.name}</SheetTitle>
        </SheetHeader>
        <SheetBody className="pt-12">
          {recommendation && (
            <RecommendationDetails recommendation={recommendation} />
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

export default RecommendationSheet;
