import { useState } from 'react';
import DesktopSidebar from './nav/DesktopSidebar';
import MobileTabBar from './nav/MobileTabBar';
import SettingsDialog from './settings/SettingsDialog';

function SidebarNav() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <DesktopSidebar onSettingsClick={() => setSettingsOpen(true)} />
      <MobileTabBar onSettingsClick={() => setSettingsOpen(true)} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

export default SidebarNav;
