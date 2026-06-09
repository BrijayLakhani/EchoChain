import React, {useState} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Pastel, FontSize} from '../theme';
import {useProfileStore, AVATAR_CHOICES} from '../store/profileStore';
import {useProgressStore} from '../store/progressStore';
import {useDailyStore} from '../store/dailyStore';
import {useEconomyStore} from '../store/economyStore';
import {LEVELS} from '../engine/levels';
import {haptic} from '../store/settingsStore';

type Props = {navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>};

export default function ProfileScreen({navigation}: Props) {
  const {userId, tag, name, avatar, createdAt, setName, setAvatar, reroll} = useProfileStore();
  const completed = useProgressStore(s => s.completed);
  const streak    = useDailyStore(s => s.streak);
  const coins     = useEconomyStore(s => s.coins);
  const gems      = useEconomyStore(s => s.gems);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(name);

  const solved = Object.keys(completed).length;
  const stars  = Object.values(completed).reduce((a, b) => a + b, 0);
  const since  = new Date(createdAt || Date.now()).toLocaleDateString(undefined, {month: 'short', year: 'numeric'});

  const saveName = () => { setName(draft); setEditing(false); haptic('tap'); };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Pastel.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={14}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{width: 22}} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Identity card */}
        <View style={styles.card}>
          <View style={styles.avatarBig}><Text style={styles.avatarFace}>{avatar}</Text></View>

          {editing ? (
            <View style={styles.nameEdit}>
              <TextInput
                style={styles.nameInput}
                value={draft}
                onChangeText={setDraft}
                autoFocus
                maxLength={18}
                onSubmitEditing={saveName}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.saveBtn} onPress={saveName}>
                <Text style={styles.saveTxt}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => { setDraft(name); setEditing(true); }} activeOpacity={0.7}>
              <Text style={styles.name}>{name} ✎</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.tag}>{tag}</Text>
          <Text style={styles.since}>Member since {since}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Stat label="Solved" value={`${solved}/${LEVELS.length}`} color={Pastel.mint} />
          <Stat label="Stars" value={`${stars}`} color={Pastel.sun} />
          <Stat label="Streak" value={`${streak}🔥`} color={Pastel.coral} />
        </View>
        <View style={styles.statsRow}>
          <Stat label="Coins" value={`${coins}`} color={Pastel.coin} />
          <Stat label="Gems" value={`${gems} 💎`} color={Pastel.grape} />
        </View>

        {/* Avatar picker */}
        <Text style={styles.section}>CHOOSE AVATAR</Text>
        <View style={styles.avatarGrid}>
          {AVATAR_CHOICES.map(a => (
            <TouchableOpacity
              key={a}
              style={[styles.avatarPick, a === avatar && styles.avatarPickOn]}
              activeOpacity={0.8}
              onPress={() => { setAvatar(a); haptic('tap'); }}>
              <Text style={styles.avatarPickTxt}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.reroll} activeOpacity={0.85} onPress={() => { reroll(); haptic('success'); }}>
          <Text style={styles.rerollTxt}>🎲  Randomize name & look</Text>
        </TouchableOpacity>

        <Text style={styles.idNote}>Anonymous ID · {userId.slice(0, 13)}…{'\n'}No account needed — stored only on this device.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({label, value, color}: {label: string; value: string; color: string}) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statVal, {color}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Pastel.bg},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 12},
  close: {fontSize: 20, color: Pastel.inkSoft, fontWeight: '700'},
  headerTitle: {fontSize: FontSize.xl, fontWeight: '900', color: Pastel.ink},

  scroll: {padding: 18, gap: 16},
  card: {
    backgroundColor: Pastel.card, borderRadius: 24, padding: 22, alignItems: 'center',
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  avatarBig: {
    width: 92, height: 92, borderRadius: 46, backgroundColor: Pastel.grape,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarFace: {fontSize: 52},
  name: {fontSize: FontSize.xxl, fontWeight: '900', color: Pastel.ink},
  nameEdit: {flexDirection: 'row', alignItems: 'center', gap: 8},
  nameInput: {
    fontSize: FontSize.xl, fontWeight: '800', color: Pastel.ink, borderBottomWidth: 2,
    borderBottomColor: Pastel.grape, minWidth: 140, textAlign: 'center', paddingVertical: 2,
  },
  saveBtn: {backgroundColor: Pastel.mint, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7},
  saveTxt: {color: '#fff', fontWeight: '900', fontSize: FontSize.sm},
  tag: {fontSize: FontSize.sm, fontWeight: '800', color: Pastel.grape, letterSpacing: 1, marginTop: 6},
  since: {fontSize: FontSize.sm, color: Pastel.inkDim, marginTop: 2},

  statsRow: {flexDirection: 'row', gap: 12},
  stat: {
    flex: 1, backgroundColor: Pastel.card, borderRadius: 18, paddingVertical: 16, alignItems: 'center',
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2,
  },
  statVal: {fontSize: FontSize.xl, fontWeight: '900'},
  statLabel: {fontSize: FontSize.xs, fontWeight: '700', color: Pastel.inkDim, marginTop: 3, letterSpacing: 0.5},

  section: {fontSize: 11, fontWeight: '900', color: Pastel.inkDim, letterSpacing: 1.5, marginTop: 4},
  avatarGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  avatarPick: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: Pastel.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  avatarPickOn: {borderColor: Pastel.grape, backgroundColor: Pastel.grape + '18'},
  avatarPickTxt: {fontSize: 26},

  reroll: {backgroundColor: Pastel.bgAlt, borderRadius: 16, paddingVertical: 15, alignItems: 'center'},
  rerollTxt: {fontSize: FontSize.md, fontWeight: '800', color: Pastel.ink},
  idNote: {fontSize: FontSize.xs, color: Pastel.inkDim, textAlign: 'center', lineHeight: 17, marginTop: 4},
});
