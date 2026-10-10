import { describe, expect, it } from 'vitest';
import {
  AvailabilityService,
  type Availability,
  type AvailabilityRepository,
} from '../src/services/AvailabilityService.js';

const monday: Availability = {
  id: 'availability-1',
  employeeId: 'employee-1',
  dayOfWeek: 'MONDAY',
  startTime: '09:00',
  endTime: '17:00',
  isAvailable: true,
};

const repository = (exists = true): AvailabilityRepository => ({
  employeeExists: async () => exists,
  findByEmployeeId: async () => [monday],
  replaceWeekly: async (employeeId, entries) => entries.map((entry, index) => ({
    id: `availability-${index + 1}`,
    employeeId,
    ...entry,
  })),
});

const week = [
  { dayOfWeek: 'MONDAY' as const, startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 'TUESDAY' as const, startTime: null, endTime: null, isAvailable: false },
  { dayOfWeek: 'WEDNESDAY' as const, startTime: '12:00', endTime: '20:00', isAvailable: true },
  { dayOfWeek: 'THURSDAY' as const, startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 'FRIDAY' as const, startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 'SATURDAY' as const, startTime: null, endTime: null, isAvailable: false },
  { dayOfWeek: 'SUNDAY' as const, startTime: null, endTime: null, isAvailable: false },
];

describe('AvailabilityService', () => {
  it('reads and replaces a complete recurring week', async () => {
    const service = new AvailabilityService(repository());
    await expect(service.getForEmployee('employee-1')).resolves.toEqual([monday]);
    await expect(service.replaceOwnWeek('employee-1', week)).resolves.toHaveLength(7);
  });

  it('returns NOT_FOUND for an unknown employee', async () => {
    const service = new AvailabilityService(repository(false));
    await expect(service.getForEmployee('missing')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
