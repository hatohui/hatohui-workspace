import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import { useRecommendationForm } from '../../hooks/useRecommendationForm';
import DialogForm from '../shared/DialogForm';
import FormSection from '../shared/FormSection';
import TextField from '../shared/TextField';
import DishLinesField from './DishLinesField';
import PhotoField from './PhotoField';
import PlaceInputs from './PlaceInputs';
import TagFields from './TagFields';

interface Props {
  recommendation?: TravelRecommendationDto;
  initialDishName?: string;
  onClose: () => void;
}

function RecommendationForm({
  recommendation,
  initialDishName,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const form = useRecommendationForm(recommendation, onClose, initialDishName);

  return (
    <DialogForm
      title={t(recommendation ? 'form.editTitle' : 'form.createTitle')}
      onSubmit={form.submit}
      canSubmit={form.canSubmit}
      isSaving={form.isSaving}
      onCancel={onClose}
    >
      <div className="space-y-6">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-8">
          <FormSection title={t('form.sectionDish')}>
            <div className="space-y-4">
              <PlaceInputs form={form} />
              <DishLinesField form={form} />
              <TextField
                id="note"
                multiline
                label={t('form.note')}
                placeholder={t('form.notePlaceholder')}
                value={form.fields.note}
                onChange={(value) => form.set('note', value)}
              />
            </div>
          </FormSection>
          <PhotoField photos={form.photos} />
        </div>
        <TagFields fields={form.fields} set={form.set} />
      </div>
    </DialogForm>
  );
}

export default RecommendationForm;
