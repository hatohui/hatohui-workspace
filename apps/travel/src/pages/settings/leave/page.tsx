import LeaveAllowanceForm from '../../../components/settings/LeaveAllowanceForm';
import { useLeaveSettingsForm } from '../../../hooks/useLeaveSettingsForm';

function SettingsLeavePage() {
  const form = useLeaveSettingsForm();
  return <LeaveAllowanceForm {...form} />;
}

export default SettingsLeavePage;
