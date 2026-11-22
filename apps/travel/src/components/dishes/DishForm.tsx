import { useTranslation } from '@hatohui/i18n';
import type { TravelDishDto } from '@hatohui/models';
import { useDishForm } from '../../hooks/useDishForm';
import CuisineField from '../shared/CuisineField';
import DialogForm from '../shared/DialogForm';
import TextField from '../shared/TextField';
import CountrySelect from '../location/CountrySelect';
import DishPhotoField from './DishPhotoField';

interface Props {
  dish: TravelDishDto;
  onClose: () => void;
}

function DishForm({ dish, onClose }: Props) {
  const { t } = useTranslation();
  const form = useDishForm(dish, onClose);

  return (
    <DialogForm
      title={t('dishes.editTitle')}
      onSubmit={(event) => void form.submit(event)}
      canSubmit={form.values.name.trim() !== ''}
      isSaving={form.isSaving}
      onCancel={onClose}
    >
      <div className="space-y-5">
        <TextField
          id="dish-name"
          required
          label={t('dishes.name')}
          value={form.values.name}
          onChange={(value) => form.set('name', value)}
        />
        <CuisineField
          id="dish-cuisines"
          optional
          value={form.values.cuisines}
          onChange={(value) => form.set('cuisines', value)}
        />
        <CountrySelect
          id="dish-country"
          value={form.values.countryId}
          onChange={(value) => form.set('countryId', value)}
        />
        <TextField
          id="dish-description"
          multiline
          optional
          label={t('dishes.description')}
          value={form.values.description}
          onChange={(value) => form.set('description', value)}
        />
        <DishPhotoField photo={form.photo} />
      </div>
    </DialogForm>
  );
}

export default DishForm;
