import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import { useRecommendationForm } from '../../hooks/useRecommendationForm';
import FormActions from '../shared/FormActions';
import FormSection from '../shared/FormSection';
import TextField from '../shared/TextField';
import DishInputs from './DishInputs';
import PhotoField from './PhotoField';
import PlaceInputs from './PlaceInputs';
import PriceField from './PriceField';
import TagFields from './TagFields';

interface Props {
  recommendation?: TravelRecommendationDto;
  onClose: () => void;
}

function RecommendationForm({ recommendation, onClose }: Props) {
  const { t } = useTranslation();
  const form = useRecommendationForm(recommendation, onClose);

  return (
    <form onSubmit={form.submit}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <div className="space-y-5">
          <FormSection title={t('form.sectionDish')}>
            <div className="grid gap-4 lg:grid-cols-2">
              <DishInputs form={form} />
              <PlaceInputs form={form} />
            </div>
          </FormSection>
          <FormSection title={t('form.sectionPrice')}>
            <PriceField fields={form.fields} set={form.set} />
          </FormSection>
          <FormSection title={t('form.sectionTags')}>
            <TagFields
              fields={form.fields}
              set={form.set}
              toggle={form.toggle}
            />
          </FormSection>
        </div>
        <div className="space-y-5 lg:sticky lg:top-0 lg:self-start">
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
      <FormActions
        canSubmit={form.canSubmit}
        isSaving={form.isSaving}
        onCancel={onClose}
      />
    </form>
  );
}

export default RecommendationForm;
