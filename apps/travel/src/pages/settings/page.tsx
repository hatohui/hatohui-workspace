import { Navigate } from 'react-router';
import routes from '../../constants/routes';

function SettingsIndexPage() {
  return <Navigate to={routes.settingsLeave} replace />;
}

export default SettingsIndexPage;
