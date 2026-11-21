import type { TravelPlaceDto } from '@hatohui/models';
import type { useDialogState } from '../../hooks/useDialogState';
import FormDialog from '../shared/FormDialog';
import PlaceForm from './PlaceForm';

interface Props {
  state: ReturnType<typeof useDialogState>;
  place: TravelPlaceDto;
}

function PlaceDialog({ state, place }: Props) {
  return (
    <FormDialog open={state.open} onOpenChange={state.setOpen}>
      <PlaceForm place={place} onClose={state.close} />
    </FormDialog>
  );
}

export default PlaceDialog;
