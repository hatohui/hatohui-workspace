import { Brush, Palette, Sparkles, Star, type LucideIcon } from 'lucide-react';

export const LANDING_RECENT_WORK_COUNT = 8;
export const LANDING_TILE_SIZES = '(min-width: 1024px) 25vw, 50vw';
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const LANDING_MOTION = {
  letterStagger: 0.04,
  floatDistancePx: 12,
  floatRotationDeg: 8,
  floatMinSeconds: 3,
  floatMaxSeconds: 6.5,
  parallaxPx: 16,
  ringSpinSeconds: 24,
  tileTiltDeg: 3,
};

export interface LandingDecor {
  icon: LucideIcon;
  className: string;
  depth: number;
}

export const LANDING_DECOR: LandingDecor[] = [
  {
    icon: Sparkles,
    className: 'top-[14%] left-[7%] size-8 text-primary',
    depth: 1.4,
  },
  {
    icon: Star,
    className: 'top-[8%] right-[12%] size-6 text-primary/70',
    depth: 0.8,
  },
  {
    icon: Palette,
    className: 'top-[42%] left-[3%] size-10 text-muted-foreground/50',
    depth: 1.8,
  },
  {
    icon: Brush,
    className: 'bottom-[18%] right-[10%] size-9 text-muted-foreground/50',
    depth: 1.6,
  },
];

export const LANDING_BLOBS: {
  position: string;
  color: string;
  depth: number;
}[] = [
  { position: '-top-24 -left-24 size-96', color: 'bg-primary/12', depth: 0.3 },
  {
    position: 'top-1/3 -right-32 size-[28rem]',
    color: 'bg-primary/6',
    depth: 0.5,
  },
  {
    position: 'bottom-0 left-1/3 size-80',
    color: 'bg-muted-foreground/10',
    depth: 0.2,
  },
];
