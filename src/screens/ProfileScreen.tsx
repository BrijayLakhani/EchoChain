import React, {useState} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, TextInput,
} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Pastel, FontSize} from '../theme';
import {useProfileStore, AVATAR_CHOICES} from '../store/profileStore';
import {useProgressStore} from '../store/progressStore';
import {useDailyStore} from '../store/dailyStore';
import {useEconomyStore} from '../store/economyStore';
import {haptic} from '../store/settingsStore';
import GameButton from '../anim/GameButton';
import Mascot from '../components/Mascot';

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
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Hero band: avatar + identity on color */}
      <View style={styles.band}>
        <SafeAreaView edges={['top']}>
          <View style={styles.bandRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={14} style={styles.bandClose}>
              <Text style={styles.bandCloseTxt}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.bandTitle}>Profile</Text>
            <View style={{width: 36}} />
          </View>

          <View style={styles.identity}>
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

          {/* mascot peeking over the band edge */}
          <View style={styles.bandMascot} pointerEvents="none">
            <Mascot size={46} color={Pastel.sun} mood="wink" />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <Animated.View entering={FadeInDown.duration(180)} style={styles.statsRow}>
          <Stat label="Solved" value={`${solved}`} color={Pastel.mint} icon="✅" />
          <Stat label="Stars" value={`${stars}`} color={Pastel.sun} icon="⭐" />
          <Stat label="Streak" value={`${streak}`} color={Pastel.coral} icon="🔥" />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(60).duration(180)} style={styles.statsRow}>
          <Stat label="Coins" value={`${coins}`} color={Pastel.coin} icon="🪙" />
          <Stat label="Gems" value={`${gems}`} color={Pastel.grape} icon="💎" />
        </Animated.View>

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

        <GameButton
          label="Randomize name & look"
          icon="🎲"
          color={Pastel.sky}
          height={52}
          textSize={15}
          onPress={() => { reroll(); haptic('success'); }}
        />

        <Text style={styles.idNote}>Anonymous ID · {userId.slice(0, 13)}…{'\n'}No account needed — stored only on this device.</Text>
      </ScrollView>
    </View>
  );
}

function Stat({label, value, color, icon}: {label: string; value: string; color: string; icon: string}) {
  return (
    <View style={[styles.stat, {borderTopColor: color}]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statVal, {color}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Pastel.bg},

  band: {
    backgroundColor: Pastel.grape,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    paddingBottom: 24,
    shadowColor: Pastel.grape, shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  bandRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8},
  bandClose: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  bandCloseTxt: {color: '#fff', fontSize: 16, fontWeight: '800'},
  bandTitle: {
    color: '#fff', fontSize: FontSize.xl, fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 2,
  },

  identity: {alignItems: 'center', marginTop: 6},
  avatarBig: {
    width: 92, height: 92, borderRadius: 46, backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    borderWidth: 3, borderColor: '#fff',
  },
  avatarFace: {fontSize: 50},
  name: {
    fontSize: FontSize.xxl, fontWeight: '900', color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 2,
  },
  nameEdit: {flexDirection: 'row', alignItems: 'center', gap: 8},
  nameInput: {
    fontSize: FontSize.xl, fontWeight: '800', color: '#fff', borderBottomWidth: 2,
    borderBottomColor: '#fff', minWidth: 140, textAlign: 'center', paddingVertical: 2,
  },
  saveBtn: {backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7},
  saveTxt: {color: Pastel.grape, fontWeight: '900', fontSize: FontSize.sm},
  tag: {fontSize: FontSize.sm, fontWeight: '900', color: 'rgba(255,255,255,0.95)', letterSpacing: 1.5, marginTop: 6},
  since: {fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2},
  bandMascot: {position: 'absolute', right: 18, bottom: -14},

  scroll: {padding: 18, gap: 14, paddingBottom: 32},

  statsRow: {flexDirection: 'row', gap: 12},
  stat: {
    flex: 1, backgroundColor: Pastel.card, borderRadius: 18, paddingVertical: 13, alignItems: 'center',
    borderTopWidth: 4,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 5, elevation: 2,
  },
  statIcon: {fontSize: 16, marginBottom: 2},
  statVal: {fontSize: FontSize.lg, fontWeight: '900'},
  statLabel: {fontSize: FontSize.xs, fontWeight: '800', color: Pastel.inkDim, marginTop: 2, letterSpacing: 0.5},

  section: {fontSize: 11, fontWeight: '900', color: Pastel.inkDim, letterSpacing: 1.5, marginTop: 2},
  avatarGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  avatarPick: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: Pastel.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  avatarPickOn: {borderColor: Pastel.grape, backgroundColor: Pastel.grape + '18'},
  avatarPickTxt: {fontSize: 26},

  idNote: {fontSize: FontSize.xs, color: Pastel.inkDim, textAlign: 'center', lineHeight: 17, marginTop: 2},
});
