import { useTranslation } from '@hatohui/i18n';
import type { TravelPlaceDto } from '@hatohui/models';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@hatohui/ui';
import type { useDialogState } from '../../hooks/useDialogState';
import { usePlaceForm } from '../../hooks/usePlaceForm';
import { PLACE_TEXT_FIELDS } from '../../constants/placeFields';
import FormActions from '../shared/FormActions';
import TextField from '../shared/TextField';

interface Props {
  state: ReturnType<typeof useDialogState>;
  place: TravelPlaceDto;
}

function PlaceDialog({ state, place }: Props) {
  const { t } = useTranslation();
  const form = usePlaceForm(place, state.close);

  return (
    <Dialog open={state.open} onOpenChange={state.setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('places.editTitle')}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(event) => void form.submit(event)}
          className="space-y-5"
        >
          {PLACE_TEXT_FIELDS.map((field) => (
            <TextField
              key={field.key}
              id={`place-${field.key}`}
              required={field.key === 'name'}
              type={field.key === 'mapsUrl' ? 'url' : 'text'}
              label={t(field.labelKey)}
              value={form.values[field.key]}
              onChange={(value) => form.set(field.key, value)}
            />
          ))}
          <TextField
            id="place-note"
            multiline
            label={t('places.note')}
            value={form.values.note}
            onChange={(value) => form.set('note', value)}
          />
          <FormActions
            canSubmit={form.values.name.trim() !== ''}
            isSaving={form.isSaving}
            onCancel={state.close}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PlaceDialog;
