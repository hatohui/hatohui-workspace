import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import { useRecommendationForm } from '../../hooks/useRecommendationForm';
import FormActions from '../shared/FormActions';
import TextField from '../shared/TextField';
import DishInputs from './DishInputs';
import FlagFields from './FlagFields';
import PhotoField from './PhotoField';
import PlaceInputs from './PlaceInputs';
import PriceField from './PriceField';

interface Props {
  recommendation?: TravelRecommendationDto;
  onClose: () => void;
}

function RecommendationForm({ recommendation, onClose }: Props) {
  const { t } = useTranslation();
  const form = useRecommendationForm(recommendation, onClose);

  return (
    <form onSubmit={form.submit} className="space-y-5">
      <DishInputs form={form} />
      <PlaceInputs form={form} />
      <FlagFields fields={form.fields} set={form.set} />
      <PriceField fields={form.fields} set={form.set} />
      <TextField
        id="note"
        multiline
        label={t('form.note')}
        placeholder={t('form.notePlaceholder')}
        value={form.fields.note}
        onChange={(value) => form.set('note', value)}
      />
      <PhotoField photos={form.photos} />
      <FormActions
        canSubmit={form.canSubmit}
        isSaving={form.isSaving}
        onCancel={onClose}
      />
    </form>
  );
}

export default RecommendationForm;
