import { Navigate } from 'react-router';
import routes from '../../constants/routes';

function DishesRedirect() {
  return <Navigate to={routes.dishes} replace />;
}

export default DishesRedirect;
