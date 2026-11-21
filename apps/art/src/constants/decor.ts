export type DoodleKind = 'ring' | 'squiggle' | 'sparkle' | 'arc' | 'triangle';
export type DoodleTone = 'coral' | 'teal' | 'muted';

export const DOODLE_SHAPES: Record<
  DoodleKind,
  { d: string; viewBox: string; filled?: boolean }
> = {
  ring: { d: 'M24 4a20 20 0 1 0 0.01 0', viewBox: '0 0 48 48' },
  squiggle: {
    d: 'M4 24C12 8 20 8 28 24S44 40 52 24 68 8 76 24',
    viewBox: '0 0 80 48',
  },
  sparkle: {
    d: 'M24 2C26 18 30 22 46 24 30 26 26 30 24 46 22 30 18 26 2 24 18 22 22 18 24 2Z',
    viewBox: '0 0 48 48',
    filled: true,
  },
  arc: { d: 'M6 42A34 34 0 0 1 74 42', viewBox: '0 0 80 48' },
  triangle: { d: 'M24 6 44 40H4Z', viewBox: '0 0 48 48' },
};

export const DOODLE_TONE_CLASSES: Record<DoodleTone, string> = {
  coral: 'text-tint-coral-foreground',
  teal: 'text-tint-teal-foreground',
  muted: 'text-muted-foreground/60',
};

export interface DoodlePlacement {
  kind: DoodleKind;
  tone: DoodleTone;
  left?: string;
  right?: string;
  size: number;
  rotate: number;
  delay: number;
}

export interface Doodle extends DoodlePlacement {
  top: string;
}

export interface DoodleField {
  pattern: DoodlePlacement[];
  startRem: number;
  stepRem: number;
}

export const DOODLE_INVIEW_MARGIN = '0px 0px -10% 0px';

export const COMMISSION_DOODLE_FIELD: DoodleField = {
  startRem: 5,
  stepRem: 7,
  pattern: [
    { kind: 'ring', tone: 'coral', left: '4%', size: 56, rotate: 0, delay: 0 },
    {
      kind: 'sparkle',
      tone: 'coral',
      right: '6%',
      size: 28,
      rotate: 0,
      delay: 0.3,
    },
    {
      kind: 'arc',
      tone: 'teal',
      right: '2.5%',
      size: 88,
      rotate: 18,
      delay: 0.1,
    },
    {
      kind: 'sparkle',
      tone: 'teal',
      left: '7%',
      size: 22,
      rotate: 0,
      delay: 0.4,
    },
    {
      kind: 'ring',
      tone: 'muted',
      right: '6%',
      size: 34,
      rotate: 0,
      delay: 0.2,
    },
    {
      kind: 'squiggle',
      tone: 'muted',
      left: '2%',
      size: 84,
      rotate: -12,
      delay: 0.3,
    },
    {
      kind: 'squiggle',
      tone: 'coral',
      right: '3%',
      size: 76,
      rotate: 8,
      delay: 0.1,
    },
    {
      kind: 'triangle',
      tone: 'teal',
      left: '5%',
      size: 40,
      rotate: 14,
      delay: 0.4,
    },
    {
      kind: 'sparkle',
      tone: 'muted',
      right: '8%',
      size: 18,
      rotate: 0,
      delay: 0.2,
    },
  ],
};

export const GALLERY_DOODLE_FIELD: DoodleField = {
  startRem: 5,
  stepRem: 11,
  pattern: [
    {
      kind: 'sparkle',
      tone: 'coral',
      left: '5%',
      size: 24,
      rotate: 0,
      delay: 0.1,
    },
    {
      kind: 'arc',
      tone: 'teal',
      right: '3%',
      size: 84,
      rotate: -16,
      delay: 0.3,
    },
    {
      kind: 'ring',
      tone: 'muted',
      left: '3%',
      size: 40,
      rotate: 0,
      delay: 0.2,
    },
    {
      kind: 'squiggle',
      tone: 'coral',
      right: '4%',
      size: 72,
      rotate: 10,
      delay: 0.1,
    },
    {
      kind: 'triangle',
      tone: 'teal',
      left: '6%',
      size: 34,
      rotate: -8,
      delay: 0.3,
    },
    {
      kind: 'sparkle',
      tone: 'muted',
      right: '7%',
      size: 18,
      rotate: 0,
      delay: 0.2,
    },
  ],
};
