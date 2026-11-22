import type { TravelSpotDto } from '@hatohui/models';
import type { useDialogState } from '../../hooks/useDialogState';
import FormDialog from '../shared/FormDialog';
import SpotForm from './SpotForm';

interface Props {
  state: ReturnType<typeof useDialogState>;
  spot?: TravelSpotDto;
}

function SpotDialog({ state, spot }: Props) {
  return (
    <FormDialog open={state.open} onOpenChange={state.setOpen}>
      <SpotForm spot={spot} onClose={state.close} />
    </FormDialog>
  );
}

export default SpotDialog;
