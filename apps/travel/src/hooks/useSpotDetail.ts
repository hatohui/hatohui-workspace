import { useNavigate, useParams } from 'react-router';
import { deleteTravelSpot, useTravelSpot } from '@hatohui/models';
import routes from '../constants/routes';
import { useConfirmedDelete } from './useConfirmedDelete';

export function useSpotDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const result = useTravelSpot(id);
  const deletion = useConfirmedDelete(
    () => deleteTravelSpot(id),
    () => void navigate(routes.spots),
  );

  return {
    spot: result.data?.data,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
    deletion,
  };
}
