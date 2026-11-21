import type { TravelSpiceLevel } from '@hatohui/models';
import { Flame } from 'lucide-react';
import { SPICE_FLAMES } from '../../constants/travel';

function SpiceFlames({ level }: { level: TravelSpiceLevel }) {
  const count = SPICE_FLAMES[level];
  if (!count) return null;
  return (
    <span className="inline-flex text-red-600 dark:text-red-400" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <Flame key={index} className="size-3.5" />
      ))}
    </span>
  );
}

export default SpiceFlames;
