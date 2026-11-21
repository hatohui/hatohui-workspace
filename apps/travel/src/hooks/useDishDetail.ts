import { useNavigate, useParams } from 'react-router';
import { deleteTravelDish, useTravelDish } from '@hatohui/models';
import routes from '../constants/routes';
import { useConfirmedDelete } from './useConfirmedDelete';

export function useDishDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const result = useTravelDish(id);
  const deletion = useConfirmedDelete(
    () => deleteTravelDish(id),
    () => void navigate(routes.dishes),
  );

  return {
    dish: result.data?.data,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
    deletion,
  };
}
