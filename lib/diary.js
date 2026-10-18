import AsyncStorage from '@react-native-async-storage/async-storage';
import { migrateImage } from './media';
import { remoteDayStatus } from './dayGate';

const JOURNAL_PREFIX = 'journal-';
const HABITS_KEY = 'aurora:habits:v1';
const BOARDS_KEY = 'aurora:boards:v1';

export const localDay = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const addDays = (day, amount) => {
  const [year, month, date] = day.split('-').map(Number);
  return localDay(new Date(year, month - 1, date + amount));
};

// Calendar dates follow the device's local time zone, including DST changes.
export const dayAccess = (day, now = new Date()) => {
  const today = localDay(now);
  const [year, month, date] = day.split('-').map(Number);
  return {
    locked: day > today,
    unlockAt: new Date(year, month - 1, date),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time',
  };
};

export const displayDate = (day, options = { weekday: 'long', month: 'long', day: 'numeric' }) => {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date).toLocaleDateString(undefined, options);
};

export async function listJournals() {
  const keys = (await AsyncStorage.getAllKeys()).filter(key => key.startsWith(JOURNAL_PREFIX));
  const pairs = await AsyncStorage.multiGet(keys);
  const entries = pairs.flatMap(([key, raw]) => {
    if (!raw) return [];
    try {
      const value = JSON.parse(raw);
      return [{
        date: key.slice(JOURNAL_PREFIX.length),
        title: value.title || '',
        text: value.text || '',
        images: Array.isArray(value.images) ? value.images : value.image ? [value.image] : [],
      }];
    } catch {
      return [];
    }
  });
  for (const entry of entries) {
    const migrated = entry.images.map(migrateImage);
    if (migrated.some((uri, index) => uri !== entry.images[index])) {
      entry.images = migrated;
      await saveJournal(entry);
    }
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveJournal(entry) {
  const remote = await remoteDayStatus(entry.date);
  if (remote ? remote.locked : dayAccess(entry.date).locked) throw new Error('Future diary pages are locked until local midnight.');
  const data = { title: entry.title.trim(), text: entry.text, images: entry.images, image: entry.images[0] || null };
  await AsyncStorage.setItem(`${JOURNAL_PREFIX}${entry.date}`, JSON.stringify(data));
}

export async function deleteJournal(day) {
  await AsyncStorage.removeItem(`${JOURNAL_PREFIX}${day}`);
}

export async function loadHabits() {
  try { return JSON.parse(await AsyncStorage.getItem(HABITS_KEY)) || []; } catch { return []; }
}

export async function saveHabits(habits) {
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export async function loadBoards() {
  try { return JSON.parse(await AsyncStorage.getItem(BOARDS_KEY)) || { Monthly: [], Yearly: [] }; }
  catch { return { Monthly: [], Yearly: [] }; }
}

export async function saveBoards(boards) {
  await AsyncStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
}

export function currentStreak(completedDates, today = localDay()) {
  const dates = new Set(completedDates || []);
  let cursor = dates.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (dates.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}
