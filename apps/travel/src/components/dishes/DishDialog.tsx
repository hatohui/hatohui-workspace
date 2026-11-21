import type { TravelDishDto } from '@hatohui/models';
import type { useDialogState } from '../../hooks/useDialogState';
import FormDialog from '../shared/FormDialog';
import DishForm from './DishForm';

interface Props {
  state: ReturnType<typeof useDialogState>;
  dish: TravelDishDto;
}

function DishDialog({ state, dish }: Props) {
  return (
    <FormDialog open={state.open} onOpenChange={state.setOpen}>
      <DishForm dish={dish} onClose={state.close} />
    </FormDialog>
  );
}

export default DishDialog;
