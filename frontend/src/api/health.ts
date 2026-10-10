export type HealthResponse = { status: 'ok'; service: string };
export async function getHealth(): Promise<HealthResponse> {
  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
  const response = await fetch(`${baseUrl}/health`);
  if (!response.ok) throw new Error('Backend health check failed');
  return response.json() as Promise<HealthResponse>;
}
