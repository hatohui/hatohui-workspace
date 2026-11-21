import { useTranslation } from '@hatohui/i18n';
import type { TravelPlaceDto } from '@hatohui/models';
import { PLACE_TEXT_FIELDS } from '../../constants/placeFields';
import { usePlaceForm } from '../../hooks/usePlaceForm';
import MapsLinkField from '../maps/MapsLinkField';
import DialogForm from '../shared/DialogForm';
import TextField from '../shared/TextField';

interface Props {
  place: TravelPlaceDto;
  onClose: () => void;
}

function PlaceForm({ place, onClose }: Props) {
  const { t } = useTranslation();
  const form = usePlaceForm(place, onClose);

  return (
    <DialogForm
      title={t('places.editTitle')}
      onSubmit={(event) => void form.submit(event)}
      canSubmit={form.values.name.trim() !== ''}
      isSaving={form.isSaving}
      onCancel={onClose}
    >
      <div className="space-y-5">
        {PLACE_TEXT_FIELDS.map((field) => (
          <TextField
            key={field.key}
            id={`place-${field.key}`}
            required={field.key === 'name'}
            label={t(field.labelKey)}
            value={form.values[field.key]}
            onChange={(value) => form.set(field.key, value)}
          />
        ))}
        <MapsLinkField
          id="place-mapsUrl"
          url={form.values.mapsUrl}
          placeName={form.values.name}
          onUrlChange={(value) => form.set('mapsUrl', value)}
          onUseName={(name) => form.set('name', name)}
        />
        <TextField
          id="place-note"
          multiline
          label={t('places.note')}
          value={form.values.note}
          onChange={(value) => form.set('note', value)}
        />
      </div>
    </DialogForm>
  );
}

export default PlaceForm;
