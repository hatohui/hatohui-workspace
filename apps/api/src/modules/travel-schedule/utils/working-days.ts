const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function formatUtcDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseUtcDateOnly(value: string): Date {
  const datePart = value.slice(0, 10);
  return new Date(`${datePart}T00:00:00.000Z`);
}

export function countWorkingDaysFromRules(opts: {
  from: Date;
  to: Date;
  workDays: readonly boolean[];
  exceptionMap: ReadonlyMap<string, boolean>;
  customHolidaySet: ReadonlySet<string>;
  publicHolidaySet: ReadonlySet<string>;
}): number {
  const cursor = new Date(
    Date.UTC(
      opts.from.getUTCFullYear(),
      opts.from.getUTCMonth(),
      opts.from.getUTCDate(),
    ),
  );
  const end = new Date(
    Date.UTC(
      opts.to.getUTCFullYear(),
      opts.to.getUTCMonth(),
      opts.to.getUTCDate(),
    ),
  );

  let count = 0;

  while (cursor <= end) {
    const dateKey = formatUtcDateKey(cursor);
    const exception = opts.exceptionMap.get(dateKey);

    if (exception !== undefined) {
      if (exception) count++;
    } else if (
      !opts.customHolidaySet.has(dateKey) &&
      !opts.publicHolidaySet.has(dateKey) &&
      opts.workDays[cursor.getUTCDay()]
    ) {
      count++;
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return count;
}

export function expandParticipationsToHeatmap(
  ranges: ReadonlyArray<{ from: Date; to: Date }>,
): Array<{ date: string; intensity: number }> {
  const map = new Map<string, number>();

  for (const { from, to } of ranges) {
    if (to <= from) continue;

    const cursor = new Date(
      Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
    );

    while (cursor < to) {
      const dayStart = cursor.getTime();
      const dayEnd = dayStart + MS_PER_DAY;
      const overlapStart = Math.max(from.getTime(), dayStart);
      const overlapEnd = Math.min(to.getTime(), dayEnd);
      const overlapDays = (overlapEnd - overlapStart) / MS_PER_DAY;

      if (overlapDays > 0) {
        const key = formatUtcDateKey(cursor);
        map.set(key, (map.get(key) ?? 0) + overlapDays);
      }

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  return Array.from(map.entries())
    .map(([date, intensity]) => ({ date, intensity }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
