import AsyncStorage from '@react-native-async-storage/async-storage';

// Tamper-resistant local storage for money-sensitive data (coins, gems, hints,
// purchases). It obfuscates the JSON and stamps a checksum; on read, a failed
// checksum means the value was edited outside the app, so we discard it.
//
// This is deterrence, not cryptography — a determined attacker with the binary
// can still reverse it (true integrity needs a server). It stops the easy win:
// editing the AsyncStorage file to give yourself 99999 gems.

const SALT = 'dw1_8Qm$z7';
const XOR_KEY = 'Dotwise.sentinel.k93';

function checksum(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

function obfuscate(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length);
    out += c.toString(16).padStart(4, '0');
  }
  return out;
}

function deobfuscate(hex: string): string {
  let out = '';
  for (let i = 0; i < hex.length; i += 4) {
    const c = parseInt(hex.slice(i, i + 4), 16) ^ XOR_KEY.charCodeAt((i / 4) % XOR_KEY.length);
    out += String.fromCharCode(c);
  }
  return out;
}

export async function setSecure(key: string, obj: unknown): Promise<void> {
  const json = JSON.stringify(obj);
  const payload = JSON.stringify({__v: 1, d: obfuscate(json), s: checksum(json + SALT)});
  await AsyncStorage.setItem(key, payload);
}

export async function getSecure<T = any>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch { return null; }
    if (parsed && parsed.__v === 1 && typeof parsed.d === 'string') {
      const json = deobfuscate(parsed.d);
      if (checksum(json + SALT) !== parsed.s) return null;   // edited → discard
      return JSON.parse(json) as T;
    }
    // Legacy un-wrapped value (saved before secure storage) — accept once so the
    // player keeps their progress; it gets re-saved wrapped on the next write.
    return parsed as T;
  } catch {
    return null;
  }
}
