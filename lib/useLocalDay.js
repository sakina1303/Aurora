import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { localDay } from './diary';
import { hasRemoteDayGate, remoteDayStatus } from './dayGate';

export default function useLocalDay() {
  const getClock = () => ({ day: localDay(), zone: Intl.DateTimeFormat().resolvedOptions().timeZone });
  const [clock, setClock] = useState(getClock);

  useEffect(() => {
    let active = true;
    let midnightTimer;
    const schedule = (milliseconds) => {
      clearTimeout(midnightTimer);
      midnightTimer = setTimeout(refresh, Math.max(100, milliseconds + 100));
    };
    const refresh = () => {
      const next = getClock();
      if (!hasRemoteDayGate) {
        setClock(current => current.day === next.day && current.zone === next.zone ? current : next);
        const now = new Date();
        const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        schedule(nextMidnight.getTime() - now.getTime());
        return;
      }
      remoteDayStatus(localDay()).then(status => {
        if (!active) return;
        setClock(current => current.day === status.today && current.zone === status.timeZone ? current : { day: status.today, zone: status.timeZone });
        schedule(new Date(status.nextMidnightAt).getTime() - new Date(status.serverNow).getTime());
      }).catch(() => {});
    };
    const poll = setInterval(refresh, 60000);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    refresh();
    return () => { active = false; clearTimeout(midnightTimer); clearInterval(poll); listener.remove(); };
  }, [clock.day, clock.zone]);

  return clock.day;
}
