import { APPLE_PLATFORM_PATTERN } from '../constants/travel';

export function useModifierKeyLabel(): string {
  const platform = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  return APPLE_PLATFORM_PATTERN.test(platform) ? '⌘' : 'Ctrl';
}
