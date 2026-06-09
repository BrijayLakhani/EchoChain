// Lightweight, offline event schedule. Events activate on a recurring weekly
// window and apply a coin multiplier. No backend — purely date-driven.

export type GameEvent = {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  multiplier: number;
  endsAt: number;   // epoch ms
};

function endOfDay(d: Date): number {
  const e = new Date(d);
  e.setHours(23, 59, 59, 999);
  return e.getTime();
}

// Returns the currently-active event, or null.
export function activeEvent(now = new Date()): GameEvent | null {
  const day = now.getDay(); // 0 Sun … 6 Sat

  // Weekend Rush — Fri 18:00 → Sun end. Double coins.
  const isFriEve = day === 5 && now.getHours() >= 18;
  if (isFriEve || day === 6 || day === 0) {
    // end = upcoming Sunday end-of-day
    const end = new Date(now);
    const toSunday = (7 - day) % 7; // 0 if Sunday
    end.setDate(end.getDate() + toSunday);
    return {
      id: 'weekend_rush',
      name: 'Weekend Rush',
      emoji: '🎉',
      desc: 'Double coins all weekend!',
      multiplier: 2,
      endsAt: endOfDay(end),
    };
  }

  // Midweek Happy Hour — Wednesday. 1.5× coins.
  if (day === 3) {
    return {
      id: 'happy_hour',
      name: 'Midweek Boost',
      emoji: '⚡',
      desc: '1.5× coins today only',
      multiplier: 1.5,
      endsAt: endOfDay(now),
    };
  }

  return null;
}

export function eventMultiplier(now = new Date()): number {
  return activeEvent(now)?.multiplier ?? 1;
}

// "2h 14m" style remaining string.
export function timeLeftStr(endsAt: number, now = Date.now()): string {
  let s = Math.max(0, Math.floor((endsAt - now) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600);  s -= h * 3600;
  const m = Math.floor(s / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
