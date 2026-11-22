import WorkScheduleForm from '../../../components/settings/WorkScheduleForm';
import { useWorkScheduleSettings } from '../../../hooks/useWorkScheduleSettings';

function SettingsSchedulePage() {
  const state = useWorkScheduleSettings();
  return <WorkScheduleForm {...state} />;
}

export default SettingsSchedulePage;
