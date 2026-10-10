export type ScheduledWindow = { startTime: string; endTime: string };

export interface DashboardRepository {
  countWorking(date: Date): Promise<number>;
  countUnfilled(start: Date, end: Date): Promise<number>;
  countApprovedLeave(date: Date): Promise<number>;
  listScheduledWindows(start: Date, end: Date): Promise<ScheduledWindow[]>;
}
const toDate = (value: string) => new Date(`${value}T00:00:00.000Z`);
const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours! * 60 + minutes!;
};

export class DashboardService {
  constructor(private readonly dashboard: DashboardRepository) {}

  async summary(today: string, weekStart: string) {
    const current = toDate(today);
    const start = toDate(weekStart);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);

    const [employeesWorkingToday, unfilledShifts, employeesOnLeave, windows] = await Promise.all([
      this.dashboard.countWorking(current),
      this.dashboard.countUnfilled(start, end),
      this.dashboard.countApprovedLeave(current),
      this.dashboard.listScheduledWindows(start, end),
    ]);
    const totalScheduledHours = windows.reduce(
      (total, window) => total + (toMinutes(window.endTime) - toMinutes(window.startTime)) / 60,
      0,
    );

    return { employeesWorkingToday, unfilledShifts, employeesOnLeave, totalScheduledHours };
  }
}
