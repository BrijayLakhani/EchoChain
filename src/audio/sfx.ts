import {useSettingsStore} from '../store/settingsStore';

// Sound facade over react-native-sound. Loads bundled WAVs from android res/raw.
// Gracefully no-ops if the native module is missing (e.g. before a rebuild).
type Key = 'tap' | 'connect' | 'coin' | 'error' | 'win';

const FILES: Record<Key, string> = {
  tap: 'tap.wav',
  connect: 'connect.wav',
  coin: 'coin.wav',
  error: 'error.wav',
  win: 'win.wav',
};

const VOL: Record<Key, number> = {
  tap: 0.5, connect: 0.6, coin: 0.8, error: 0.6, win: 0.9,
};

let Sound: any = null;
const players: Partial<Record<Key, any>> = {};
let ready = false;

export function initSfx() {
  if (ready) return;
  ready = true;
  try {
    Sound = require('react-native-sound');
    Sound.setCategory('Playback', false);
    (Object.keys(FILES) as Key[]).forEach(k => {
      const p = new Sound(FILES[k], Sound.MAIN_BUNDLE, (err: any) => {
        if (!err) p.setVolume(VOL[k]);
      });
      players[k] = p;
    });
  } catch {
    Sound = null; // module not linked yet — stay silent
  }
}

export function sfx(name: Key) {
  if (!useSettingsStore.getState().sound) return;
  const p = players[name];
  if (!p) return;
  try {
    p.stop(() => { p.setCurrentTime(0); p.play(); });
  } catch {}
}
