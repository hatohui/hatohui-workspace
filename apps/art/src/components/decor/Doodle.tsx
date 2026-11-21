'use client';

import type { CSSProperties } from 'react';
import { cn } from '@hatohui/ui';
import {
  DOODLE_SHAPES,
  DOODLE_TONE_CLASSES,
  type Doodle as DoodleSpec,
} from '@/constants/decor';

export function Doodle({ doodle }: { doodle: DoodleSpec }) {
  const shape = DOODLE_SHAPES[doodle.kind];
  const style = {
    top: doodle.top,
    left: doodle.left,
    right: doodle.right,
    width: doodle.size,
    '--doodle-rotate': `${doodle.rotate}deg`,
    '--doodle-delay': `${doodle.delay}s`,
  } as CSSProperties;

  return (
    <svg
      viewBox={shape.viewBox}
      style={style}
      className={cn(
        'doodle absolute',
        shape.filled && 'doodle-twinkle',
        DOODLE_TONE_CLASSES[doodle.tone],
      )}
    >
      <path
        d={shape.d}
        pathLength={1}
        className="doodle-stroke"
        fill={shape.filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={shape.filled ? 0 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
