import { describe, expect, it } from 'vitest';
import { businessDayOfWeek, parseStrictTime, startOfBusinessWeek } from '../src/shiftops/BusinessTime.js';

describe('business date and time invariants', () => {
  it('accepts strict HH:mm and rejects malformed or out-of-range values', () => {
    expect(parseStrictTime('09:00')).toBe(540);
    expect(parseStrictTime('9:00')).toBeNull();
    expect(parseStrictTime('24:00')).toBeNull();
    expect(parseStrictTime('09:60')).toBeNull();
  });

  it('uses the @db.Date UTC-midnight encoding across Sunday and Monday', () => {
    const sunday = new Date('2026-10-04T00:00:00.000Z');
    const monday = new Date('2026-10-05T00:00:00.000Z');
    expect(businessDayOfWeek(sunday)).toBe('SUNDAY');
    expect(startOfBusinessWeek(sunday).toISOString()).toBe('2026-09-28T00:00:00.000Z');
    expect(startOfBusinessWeek(monday).toISOString()).toBe('2026-10-05T00:00:00.000Z');
  });

  it('does not shift date-only values at Sydney DST boundaries', () => {
    expect(businessDayOfWeek(new Date('2026-10-04T00:00:00.000Z'))).toBe('SUNDAY');
    expect(businessDayOfWeek(new Date('2026-04-05T00:00:00.000Z'))).toBe('SUNDAY');
  });
});
