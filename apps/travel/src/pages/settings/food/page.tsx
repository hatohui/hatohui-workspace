import AllergiesForm from '../../../components/settings/AllergiesForm';
import { useAllergySettings } from '../../../hooks/useAllergySettings';

function SettingsFoodPage() {
  const state = useAllergySettings();
  return <AllergiesForm {...state} />;
}

export default SettingsFoodPage;
