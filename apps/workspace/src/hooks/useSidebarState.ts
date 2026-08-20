import { useState } from 'react';

const STORAGE_KEY = 'workspace:sidebar';
const DEFAULT_WIDTH = 192;
const MIN_WIDTH = 160;
const MAX_WIDTH = 360;
const COLLAPSED_WIDTH = 64;

interface StoredSidebarState {
  width: number;
  collapsed: boolean;
}

function loadStored(): StoredSidebarState {
  if (typeof window === 'undefined') {
    return { width: DEFAULT_WIDTH, collapsed: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { width: DEFAULT_WIDTH, collapsed: false };
    const parsed = JSON.parse(raw) as Partial<StoredSidebarState>;
    return {
      width: parsed.width ?? DEFAULT_WIDTH,
      collapsed: parsed.collapsed ?? false,
    };
  } catch {
    return { width: DEFAULT_WIDTH, collapsed: false };
  }
}

function persist(state: StoredSidebarState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useSidebarState() {
  const [state, setState] = useState<StoredSidebarState>(loadStored);

  const setWidth = (width: number) => {
    const clamped = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));
    setState((prev) => {
      const next = { ...prev, width: clamped };
      persist(next);
      return next;
    });
  };

  const toggleCollapsed = () => {
    setState((prev) => {
      const next = { ...prev, collapsed: !prev.collapsed };
      persist(next);
      return next;
    });
  };

  return {
    width: state.collapsed ? COLLAPSED_WIDTH : state.width,
    collapsed: state.collapsed,
    setWidth,
    toggleCollapsed,
  };
}
