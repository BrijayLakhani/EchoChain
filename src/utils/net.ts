// Lightweight, on-demand connectivity check. The game itself is fully offline,
// so we only probe the network right before an action that NEEDS it (watching
// a rewarded ad). A tiny request to a 204 endpoint is enough — no native
// NetInfo dependency, no background monitoring, no rebuild.

const PROBE_URLS = [
  'https://clients3.google.com/generate_204',
  'https://www.gstatic.com/generate_204',
];

export async function isOnline(timeoutMs = 3500): Promise<boolean> {
  for (const url of PROBE_URLS) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      const res = await fetch(url, {method: 'GET', signal: ctrl.signal});
      clearTimeout(t);
      if (res.status === 204 || res.ok) return true;
    } catch {
      // try next endpoint
    }
  }
  return false;
}
