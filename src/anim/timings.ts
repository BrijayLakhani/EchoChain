import {useSettingsStore} from '../store/settingsStore';

// Central animation timing. Snappy by default; Turbo mode halves everything.
// Rule of thumb: decorative motion must never gate interaction — buttons are
// tappable immediately, entrances are short, delays are minimal.
export function dur(ms: number): number {
  return useSettingsStore.getState().turbo ? Math.round(ms * 0.5) : ms;
}

export const T = {
  tapIn: 60,        // press-down feedback
  fade: 140,        // modal/backdrop fades
  pop: 200,         // card/badge pop-in
  stagger: 14,      // per-item list stagger
  staggerCap: 8,    // max items that stagger (rest appear together)
  count: 320,       // number count-up
};
