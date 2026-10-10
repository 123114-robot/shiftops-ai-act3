export const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
export type DayOfWeek = typeof daysOfWeek[number];

export type AvailabilityEntry = {
  id?: string;
  employeeId?: string;
  dayOfWeek: DayOfWeek;
  startTime: string | null;
  endTime: string | null;
  isAvailable: boolean;
};

export function completeWeek(entries: AvailabilityEntry[]): AvailabilityEntry[] {
  return daysOfWeek.map((dayOfWeek) => entries.find((entry) => entry.dayOfWeek === dayOfWeek) ?? {
    dayOfWeek, startTime: null, endTime: null, isAvailable: false,
  });
}

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function availabilityRequest(path: string, token: string, init: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? 'Availability request failed.');
  }
  return response.json() as Promise<{ availability: AvailabilityEntry[] }>;
}

export async function getMyAvailability(token: string) {
  return (await availabilityRequest('/availability/me', token)).availability;
}

export async function replaceMyAvailability(token: string, availability: AvailabilityEntry[]) {
  return (await availabilityRequest('/availability/me', token, { method: 'PUT', body: JSON.stringify({ availability }) })).availability;
}

export async function getEmployeeAvailability(token: string, employeeId: string) {
  return (await availabilityRequest(`/employees/${employeeId}/availability`, token)).availability;
}
