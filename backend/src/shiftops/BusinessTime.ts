export const businessDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

export function parseStrictTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

// Shift.date is @db.Date. Prisma exposes that date-only value as UTC midnight;
// UTC operations preserve the intended business calendar date across host zones and DST.
export function businessDayOfWeek(date: Date) {
  return businessDays[date.getUTCDay()]!;
}

export function startOfBusinessWeek(date: Date) {
  const start = new Date(date);
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}
