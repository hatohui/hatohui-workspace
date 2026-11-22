import { useState } from 'react';

export function useChipOverflow<T extends string>(
  options: readonly T[],
  selected: readonly T[],
  limit: number | undefined,
) {
  const [expanded, setExpanded] = useState(false);
  const canCollapse = limit !== undefined && options.length > limit;

  const visible =
    !canCollapse || expanded
      ? options
      : options.filter(
          (option, index) => index < limit || selected.includes(option),
        );

  return {
    visible,
    hiddenCount: options.length - visible.length,
    canCollapse,
    expanded,
    toggle: () => setExpanded((value) => !value),
  };
}
