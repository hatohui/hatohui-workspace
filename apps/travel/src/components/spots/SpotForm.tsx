import { useTranslation } from '@hatohui/i18n';
import type { TravelSpotDto } from '@hatohui/models';
import { useSpotForm } from '../../hooks/useSpotForm';
import AreaSelect from '../location/AreaSelect';
import MapsLinkField from '../maps/MapsLinkField';
import PhotoField from '../recommendation/PhotoField';
import DialogForm from '../shared/DialogForm';
import TextField from '../shared/TextField';
import SpotCategoryField from './SpotCategoryField';
import SpotTagFields from './SpotTagFields';

interface Props {
  spot?: TravelSpotDto;
  onClose: () => void;
}

function SpotForm({ spot, onClose }: Props) {
  const { t } = useTranslation();
  const form = useSpotForm(spot, onClose);

  return (
    <DialogForm
      title={t(spot ? 'spots.editTitle' : 'spots.createTitle')}
      onSubmit={(event) => void form.submit(event)}
      canSubmit={form.canSubmit}
      isSaving={form.isSaving}
      onCancel={onClose}
    >
      <div className="space-y-5">
        <TextField
          id="spot-name"
          required
          label={t('spots.name')}
          placeholder={t('spots.namePlaceholder')}
          value={form.values.name}
          onChange={(value) => form.set('name', value)}
        />
        <AreaSelect
          id="spot-area"
          value={form.values.areaId}
          onChange={(value) => form.set('areaId', value)}
        />
        <SpotCategoryField
          id="spot-categories"
          optional
          value={form.values.categories}
          onChange={(value) => form.set('categories', value)}
        />
        <TextField
          id="spot-address"
          optional
          label={t('spots.address')}
          placeholder={t('spots.addressPlaceholder')}
          value={form.values.address}
          onChange={(value) => form.set('address', value)}
        />
        <MapsLinkField
          id="spot-mapsUrl"
          url={form.values.mapsUrl}
          placeName={form.values.name}
          onUrlChange={(value) => form.set('mapsUrl', value)}
          onUseName={(name) => form.set('name', name)}
        />
        <TextField
          id="spot-note"
          optional
          multiline
          label={t('spots.note')}
          placeholder={t('spots.notePlaceholder')}
          value={form.values.note}
          onChange={(value) => form.set('note', value)}
        />
        <SpotTagFields values={form.values} set={form.set} />
        <PhotoField photos={form.photos} />
      </div>
    </DialogForm>
  );
}

export default SpotForm;
