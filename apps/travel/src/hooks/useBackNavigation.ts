import { useLocation, useNavigate } from 'react-router';
import { INITIAL_LOCATION_KEY } from '../constants/travel';

export function useBackNavigation(fallback: string) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasHistory = location.key !== INITIAL_LOCATION_KEY;

  return () => {
    if (hasHistory) void navigate(-1);
    else void navigate(fallback);
  };
}
