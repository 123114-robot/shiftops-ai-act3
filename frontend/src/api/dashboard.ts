export type DashboardSummary = {
  employeesWorkingToday: number;
  unfilledShifts: number;
  employeesOnLeave: number;
  totalScheduledHours: number;
};

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function getDashboard(token: string, today: string, weekStart: string) {
  const params = new URLSearchParams({ today, weekStart });
  const response = await fetch(`${baseUrl}/dashboard?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Unable to load dashboard.');
  const body = (await response.json()) as { dashboard?: DashboardSummary };
  if (!body.dashboard) throw new Error('Dashboard response was incomplete.');
  return body.dashboard;
}
