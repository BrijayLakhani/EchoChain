import {create} from 'zustand';

type Kind = 'info' | 'error' | 'success';
interface ToastState {
  msg: string | null;
  kind: Kind;
  show: (msg: string, kind?: Kind) => void;
  hide: () => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>(set => ({
  msg: null,
  kind: 'info',
  show: (msg, kind = 'info') => {
    set({msg, kind});
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => set({msg: null}), 2800);
  },
  hide: () => { if (timer) clearTimeout(timer); set({msg: null}); },
}));

// Convenience: call from anywhere (stores, handlers).
export const toast = (msg: string, kind: Kind = 'info') => useToastStore.getState().show(msg, kind);
