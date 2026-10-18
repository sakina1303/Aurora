const test = require('node:test');
const assert = require('node:assert/strict');
const { dayStatus } = require('./dayPolicy.cjs');

test('India unlocks at its own midnight', () => {
  const before = dayStatus('2026-10-17', 'Asia/Kolkata', new Date('2026-10-16T18:29:59Z'));
  const after = dayStatus('2026-10-17', 'Asia/Kolkata', new Date('2026-10-16T18:30:00Z'));
  assert.equal(before.locked, true);
  assert.equal(after.locked, false);
  assert.equal(before.unlockAt, '2026-10-16T18:30:00.000Z');
});

test('New York unlocks at its own midnight across daylight saving time', () => {
  const status = dayStatus('2026-03-09', 'America/New_York', new Date('2026-03-09T03:59:59Z'));
  assert.equal(status.locked, true);
  assert.equal(status.unlockAt, '2026-03-09T04:00:00.000Z');
});

test('invalid dates and zones are rejected', () => {
  assert.throws(() => dayStatus('2026-02-30', 'Asia/Kolkata'));
  assert.throws(() => dayStatus('2026-10-17', 'Wrong/Zone'));
});
