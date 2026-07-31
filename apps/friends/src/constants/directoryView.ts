export type ViewMode = 'timeline' | 'calendar';
export type GroupOption = 'month' | 'age' | 'year' | 'none';
export type SortDirection = 'asc' | 'desc';

export const VIEW_MODES: ViewMode[] = ['timeline', 'calendar'];
export const GROUP_OPTIONS: GroupOption[] = ['month', 'age', 'year', 'none'];

export const SEARCH_DEBOUNCE_MS = 250;
export const CALENDAR_MAX_VISIBLE_PER_DAY = 2;
export const UPCOMING_SECTIONS_PAGE_SIZE = 20;

export const VIEW_MODE_STORAGE_KEY = 'friends.directory.viewMode';
