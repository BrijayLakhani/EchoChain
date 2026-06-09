import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@echo_profile_v2';

const ADJ = ['Sneaky', 'Happy', 'Clever', 'Brave', 'Sleepy', 'Lucky', 'Witty', 'Mighty', 'Jolly', 'Swift', 'Cozy', 'Zippy'];
const NOUN = ['Pie', 'Bean', 'Dot', 'Puff', 'Fox', 'Bun', 'Pip', 'Tofu', 'Mochi', 'Nugget', 'Pebble', 'Sprout'];
const AVATARS = ['🙂', '😺', '🦊', '🐸', '🐼', '🐯', '🦁', '🐻', '🐨', '🐶', '🐰', '🐵', '🦄', '🐙'];

const randName = () => `${ADJ[Math.floor(Math.random() * ADJ.length)]} ${NOUN[Math.floor(Math.random() * NOUN.length)]}`;
const randAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)];

// UUID v4 without a native crypto dependency (lightweight, fine for an
// anonymous app-instance id). Persisted once, stable across launches.
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Short, human-friendly player tag derived from the uuid, e.g. "FLOW-9F3A".
function tagFrom(id: string): string {
  return 'FLOW-' + id.replace(/-/g, '').slice(0, 6).toUpperCase();
}

interface ProfileState {
  userId: string;        // stable anonymous id (uuid v4)
  tag: string;           // short display id
  name: string;
  avatar: string;
  createdAt: number;     // first-run epoch ms ("member since")
  loaded: boolean;
  load: () => Promise<void>;
  setName: (n: string) => void;
  reroll: () => void;          // new random avatar + name (id stays!)
  setAvatar: (a: string) => void;
}

export const AVATAR_CHOICES = AVATARS;

export const useProfileStore = create<ProfileState>((set, get) => {
  const persist = () => {
    const {userId, name, avatar, createdAt} = get();
    AsyncStorage.setItem(KEY, JSON.stringify({userId, name, avatar, createdAt}));
  };
  return {
    userId: '',
    tag: '',
    name: 'Player',
    avatar: '🙂',
    createdAt: 0,
    loaded: false,

    load: async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const p = JSON.parse(raw);
          const userId = p.userId ?? uuidv4();
          set({
            userId,
            tag: tagFrom(userId),
            name: p.name ?? randName(),
            avatar: p.avatar ?? randAvatar(),
            createdAt: p.createdAt ?? Date.now(),
            loaded: true,
          });
          if (!p.userId) persist();
        } else {
          const userId = uuidv4();
          const profile = {userId, name: randName(), avatar: randAvatar(), createdAt: Date.now()};
          set({...profile, tag: tagFrom(userId), loaded: true});
          AsyncStorage.setItem(KEY, JSON.stringify(profile));
        }
      } catch { set({loaded: true}); }
    },

    setName: (n) => { set({name: n.trim().slice(0, 18) || 'Player'}); persist(); },
    setAvatar: (a) => { set({avatar: a}); persist(); },
    // Reroll changes the look/name but NEVER the stable userId.
    reroll: () => { set({name: randName(), avatar: randAvatar()}); persist(); },
  };
});
