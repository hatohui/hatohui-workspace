import HolidaysForm from '../../../components/settings/HolidaysForm';
import { useHolidaySettings } from '../../../hooks/useHolidaySettings';

function SettingsHolidaysPage() {
  const state = useHolidaySettings();
  return <HolidaysForm {...state} />;
}

export default SettingsHolidaysPage;
