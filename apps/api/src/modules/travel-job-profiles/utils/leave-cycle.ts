function addUtcYears(date: Date, years: number): Date {
  const next = new Date(date.getTime());
  next.setUTCFullYear(next.getUTCFullYear() + years);
  return next;
}

export function resolveLeaveCycle(
  cycleAnchor: Date,
  now: Date = new Date(),
): { cycleFrom: Date; cycleTo: Date } {
  let cycleFrom = new Date(cycleAnchor.getTime());

  while (addUtcYears(cycleFrom, 1) <= now) {
    cycleFrom = addUtcYears(cycleFrom, 1);
  }
  while (cycleFrom > now) {
    cycleFrom = addUtcYears(cycleFrom, -1);
  }

  return {
    cycleFrom,
    cycleTo: addUtcYears(cycleFrom, 1),
  };
}
