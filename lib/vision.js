import AsyncStorage from '@react-native-async-storage/async-storage';
import { localDay } from './diary';

const KEY = 'aurora:vision:v2';
const LEGACY_KEY = 'aurora:boards:v1';

export const periodKey = (kind, day = localDay()) => kind === 'Yearly' ? day.slice(0, 4) : day.slice(0, 7);

export const nextPeriodKey = (kind, key) => {
  if (kind === 'Yearly') return String(Number(key) + 1);
  const [year, month] = key.split('-').map(Number);
  const next = new Date(year, month, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
};

export const periodLabel = (kind, key) => kind === 'Yearly'
  ? key
  : new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

export const emptyVision = () => ({ version: 2, periods: { Monthly: {}, Yearly: {} } });

export const boardItems = (vision, kind, key) => vision.periods?.[kind]?.[key] || [];

export const boardHistory = (vision, today = localDay()) => ['Monthly', 'Yearly'].flatMap(kind =>
  Object.entries(vision.periods?.[kind] || {})
    .filter(([key, items]) => key < periodKey(kind, today) && items.length)
    .map(([key, items]) => ({ kind, key, label: periodLabel(kind, key), total: items.length, done: items.filter(item => item.done).length }))
).sort((a, b) => b.key.localeCompare(a.key));

export async function loadVision() {
  const current = await AsyncStorage.getItem(KEY);
  if (current) {
    try {
      const parsed = JSON.parse(current);
      if (parsed?.version === 2 && parsed.periods) return parsed;
    } catch {}
  }
  const vision = emptyVision();
  const legacy = await AsyncStorage.getItem(LEGACY_KEY);
  if (legacy) {
    try {
      const old = JSON.parse(legacy);
      for (const kind of ['Monthly', 'Yearly']) {
        if (Array.isArray(old[kind]) && old[kind].length) {
          vision.periods[kind][periodKey(kind)] = old[kind].map(item => ({ ...item, done: false }));
        }
      }
    } catch {}
  }
  await saveVision(vision);
  return vision;
}

export async function saveVision(vision) {
  await AsyncStorage.setItem(KEY, JSON.stringify(vision));
}
