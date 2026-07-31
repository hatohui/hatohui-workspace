import { useSettingsModal } from '../../hooks/useSettingsModal';
import SettingsDialog from './SettingsDialog';

function GlobalSettingsDialog() {
  const { isOpen, close } = useSettingsModal();

  return (
    <SettingsDialog open={isOpen} onOpenChange={(next) => !next && close()} />
  );
}

export default GlobalSettingsDialog;
