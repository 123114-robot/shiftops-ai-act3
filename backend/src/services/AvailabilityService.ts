export const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
export type DayOfWeek = typeof daysOfWeek[number];

export type Availability = {
  id: string;
  employeeId: string;
  dayOfWeek: DayOfWeek;
  startTime: string | null;
  endTime: string | null;
  isAvailable: boolean;
};

export type AvailabilityInput = Omit<Availability, 'id' | 'employeeId'>;

export interface AvailabilityRepository {
  employeeExists(employeeId: string): Promise<boolean>;
  findByEmployeeId(employeeId: string): Promise<Availability[]>;
  replaceWeekly(employeeId: string, entries: AvailabilityInput[]): Promise<Availability[]>;
}

export class AvailabilityError extends Error {
  constructor(public readonly code: 'NOT_FOUND', message: string) { super(message); }
}

export class AvailabilityService {
  constructor(private readonly availability: AvailabilityRepository) {}

  async getForEmployee(employeeId: string) {
    if (!(await this.availability.employeeExists(employeeId))) {
      throw new AvailabilityError('NOT_FOUND', 'Employee not found.');
    }
    return this.availability.findByEmployeeId(employeeId);
  }

  async replaceOwnWeek(employeeId: string, entries: AvailabilityInput[]) {
    if (!(await this.availability.employeeExists(employeeId))) {
      throw new AvailabilityError('NOT_FOUND', 'Employee not found.');
    }
    return this.availability.replaceWeekly(employeeId, entries);
  }
}
