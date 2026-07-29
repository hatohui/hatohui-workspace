import { useState } from 'react';

function useSidebarExpanded() {
  const [expanded, setExpanded] = useState(false);

  return {
    expanded,
    toggle: () => setExpanded((prev) => !prev),
    collapse: () => setExpanded(false),
    expand: () => setExpanded(true),
  };
}

export default useSidebarExpanded;
