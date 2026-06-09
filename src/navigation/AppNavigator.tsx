import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LevelSelectScreen from '../screens/LevelSelectScreen';
import GameScreen from '../screens/GameScreen';
import ShopScreen from '../screens/ShopScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsScreen from '../screens/TermsScreen';
import ConsentScreen from '../screens/ConsentScreen';

export type RootStackParamList = {
  Consent: undefined;
  Home: undefined;
  LevelSelect: undefined;
  Game: {levelId: number; daily?: boolean};
  Shop: undefined;
  Settings: undefined;
  Profile: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({initialRoute}: {initialRoute: keyof RootStackParamList}) {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen name="Consent" component={ConsentScreen} options={{animation: 'fade'}} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} options={{animation: 'slide_from_bottom'}} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{animation: 'slide_from_bottom'}} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{animation: 'slide_from_bottom'}} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{animation: 'slide_from_bottom'}} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{animation: 'slide_from_bottom'}} />
    </Stack.Navigator>
  );
}
