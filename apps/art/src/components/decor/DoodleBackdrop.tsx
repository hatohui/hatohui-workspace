'use client';

import type { DoodleField } from '@/constants/decor';
import { useDoodleField } from '@/hooks/useDoodleField';
import { Doodle } from './Doodle';

export function DoodleBackdrop({ field }: { field: DoodleField }) {
  const { ref, doodles } = useDoodleField(field);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden lg:block"
    >
      {doodles.map((doodle) => (
        <Doodle key={doodle.top} doodle={doodle} />
      ))}
    </div>
  );
}
