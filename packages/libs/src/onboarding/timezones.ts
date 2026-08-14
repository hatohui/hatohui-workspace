export const FALLBACK_TIMEZONE = 'UTC';

export function detectTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? FALLBACK_TIMEZONE;
}

export function listTimezones(): string[] {
  const supported = Intl.supportedValuesOf?.('timeZone') ?? [];
  return supported.length > 0 ? [...supported] : [FALLBACK_TIMEZONE];
}

export function timezoneOptions(
  current: string,
): { value: string; label: string }[] {
  const names = listTimezones();
  const all = names.includes(current) ? names : [current, ...names];
  return all.map((name) => ({ value: name, label: formatTimezone(name) }));
}

function formatTimezone(name: string): string {
  const offset = offsetLabel(name);
  return offset ? `${name.replaceAll('_', ' ')} (${offset})` : name;
}

function offsetLabel(name: string): string | null {
  try {
    const part = new Intl.DateTimeFormat('en', {
      timeZone: name,
      timeZoneName: 'shortOffset',
    })
      .formatToParts(new Date())
      .find((entry) => entry.type === 'timeZoneName');
    return part?.value ?? null;
  } catch {
    return null;
  }
}
