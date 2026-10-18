const apiUrl = process.env.EXPO_PUBLIC_AURORA_API_URL;
export const hasRemoteDayGate = !!apiUrl;

export async function remoteDayStatus(day) {
  if (!apiUrl) return null;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const query = `date=${encodeURIComponent(day)}&timeZone=${encodeURIComponent(timeZone)}`;
  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/day-access?${query}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not verify the day with Aurora’s time service.');
  return response.json();
}
