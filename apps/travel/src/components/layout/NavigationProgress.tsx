import { useNavigation } from 'react-router';
import { NAV_PROGRESS_DELAY_MS } from '../../constants/routes';
import { useDelayedFlag } from '../../hooks/useDelayedFlag';

function NavigationProgress() {
  const navigation = useNavigation();
  const visible = useDelayedFlag(
    navigation.state !== 'idle',
    NAV_PROGRESS_DELAY_MS,
  );
  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-busy="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/15"
    >
      <div className="h-full w-1/3 animate-[nav-progress_1.1s_ease-in-out_infinite] rounded-full bg-primary motion-reduce:w-full motion-reduce:animate-none" />
    </div>
  );
}

export default NavigationProgress;
