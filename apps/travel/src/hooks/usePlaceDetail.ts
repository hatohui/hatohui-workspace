import { useNavigate, useParams } from 'react-router';
import { deleteTravelPlace, useTravelPlace } from '@hatohui/models';
import routes from '../constants/routes';
import { useConfirmedDelete } from './useConfirmedDelete';

export function usePlaceDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const result = useTravelPlace(id);
  const deletion = useConfirmedDelete(
    () => deleteTravelPlace(id),
    () => void navigate(routes.places),
  );

  return {
    place: result.data?.data,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
    deletion,
  };
}
