const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validDate(day) {
  if (!DATE_PATTERN.test(day || '')) return false;
  const [year, month, date] = day.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, date)).toISOString().slice(0, 10) === day;
}

function validTimeZone(timeZone) {
  if (typeof timeZone !== 'string' || timeZone.length > 80) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone }); return true; }
  catch { return false; }
}

function dayInZone(now, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

// First UTC instant on the requested calendar date in the selected time zone.
function unlockInstant(day, timeZone) {
  const [year, month, date] = day.split('-').map(Number);
  const center = Date.UTC(year, month - 1, date);
  let low = center - 36 * 60 * 60 * 1000;
  let high = center + 36 * 60 * 60 * 1000;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (dayInZone(new Date(middle), timeZone) >= day) high = middle;
    else low = middle + 1;
  }
  return new Date(low).toISOString();
}

function dayStatus(day, timeZone, now = new Date()) {
  if (!validDate(day)) throw new Error('Invalid calendar date.');
  if (!validTimeZone(timeZone)) throw new Error('Invalid IANA time zone.');
  const today = dayInZone(now, timeZone);
  const [year, month, date] = today.split('-').map(Number);
  const tomorrow = new Date(Date.UTC(year, month - 1, date + 1)).toISOString().slice(0, 10);
  return { date: day, today, timeZone, locked: day > today, unlockAt: unlockInstant(day, timeZone), nextMidnightAt: unlockInstant(tomorrow, timeZone), serverNow: now.toISOString() };
}

module.exports = { dayStatus, dayInZone, validDate, validTimeZone };
