import { Navigate } from 'react-router';
import routes from '../../constants/routes';

function PlacesRedirect() {
  return <Navigate to={routes.places} replace />;
}

export default PlacesRedirect;
