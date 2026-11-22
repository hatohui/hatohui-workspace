import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import { useRecommendationForm } from '../../hooks/useRecommendationForm';
import DialogForm from '../shared/DialogForm';
import FormSection from '../shared/FormSection';
import TextField from '../shared/TextField';
import DishInputs from './DishInputs';
import PhotoField from './PhotoField';
import PlaceInputs from './PlaceInputs';
import TagFields from './TagFields';

interface Props {
  recommendation?: TravelRecommendationDto;
  onClose: () => void;
}

function RecommendationForm({ recommendation, onClose }: Props) {
  const { t } = useTranslation();
  const form = useRecommendationForm(recommendation, onClose);

  return (
    <DialogForm
      title={t(recommendation ? 'form.editTitle' : 'form.createTitle')}
      onSubmit={form.submit}
      canSubmit={form.canSubmit}
      isSaving={form.isSaving}
      onCancel={onClose}
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-8">
        <div className="space-y-5">
          <FormSection title={t('form.sectionDish')}>
            <div className="grid gap-4 sm:grid-cols-2">
              <DishInputs form={form} />
              <PlaceInputs form={form} />
            </div>
          </FormSection>
          <TagFields fields={form.fields} set={form.set} />
        </div>
        <div className="space-y-5">
          <PhotoField photos={form.photos} />
          <TextField
            id="note"
            multiline
            label={t('form.note')}
            placeholder={t('form.notePlaceholder')}
            value={form.fields.note}
            onChange={(value) => form.set('note', value)}
          />
        </div>
      </div>
    </DialogForm>
  );
}

export default RecommendationForm;
