import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@hatohui/libs';
import routes from '../constants/routes';

type Props = {
  children: ReactNode;
};

function RequireAuth({ children }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to={routes.dashboard} replace />;
  }

  return children;
}

export default RequireAuth;
