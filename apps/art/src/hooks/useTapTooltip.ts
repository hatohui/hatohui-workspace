'use client';

import { useState, type MouseEvent, type PointerEvent } from 'react';

/// Lets a tooltip open on tap/click as well as hover.
export function useTapTooltip() {
  const [open, setOpen] = useState(false);

  return {
    open,
    onOpenChange: setOpen,
    triggerProps: {
      onPointerDown: (event: PointerEvent) => event.preventDefault(),
      onClick: (event: MouseEvent) => {
        event.preventDefault();
        setOpen(true);
      },
    },
  };
}
