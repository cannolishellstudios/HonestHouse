import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Calculator, Map, LayoutGrid, BookOpen, Home, Flame, Star, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MathScreen from '../screens/MathScreen';
import GamePlanScreen from '../screens/GamePlanScreen';
import WhatIfScreen from '../screens/WhatIfScreen';
import BSFilterScreen from '../screens/BSFilterScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/store';
import { PaywallModal } from '../components';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const streak = useAppStore(s => s.streak);
  const isPro = useAppStore(s => s.isPro);
  const insets = useSafeAreaInsets();
  const [showPay, sPay] = useState(false);
  const setPro = useAppStore(s => s.setPro);

  const ti = (focused: boolean) => ({ width: 32, height: 32, borderRadius: 8, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: focused ? colors.greenBg : 'transparent', borderWidth: focused ? 2 : 0, borderColor: colors.green });

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 2, borderBottomColor: colors.border, paddingHorizontal: 16, paddingBottom: 8, paddingTop: insets.top + 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Home size={22} color={colors.green} />
          <Text style={{ fontSize: 17, fontWeight: '900', color: colors.text }}>honest<Text style={{ color: colors.green }}>house</Text></Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ backgroundColor: colors.orangeBg, borderWidth: 1.5, borderColor: colors.orange, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Flame size={13} color={colors.orange} /><Text style={{ fontSize: 11, fontWeight: '900', color: colors.orangeDark }}>{streak}</Text>
          </View>
          <TouchableOpacity onPress={() => sPay(true)} activeOpacity={0.8}
            style={{ backgroundColor: isPro ? colors.greenBg : colors.purpleBg, borderWidth: 1.5, borderColor: isPro ? colors.green : colors.purple, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Star size={11} color={isPro ? colors.green : colors.purple} fill={isPro ? colors.green : colors.purple} />
            <Text style={{ fontSize: 10, fontWeight: '800', color: isPro ? colors.greenDark : colors.purpleDark }}>{isPro ? 'PRO' : 'PRO'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Tab.Navigator screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: colors.border, borderTopWidth: 2, paddingBottom: insets.bottom > 0 ? insets.bottom : 10, paddingTop: 4, height: 56 + (insets.bottom > 0 ? insets.bottom : 10) },
        tabBarActiveTintColor: colors.green, tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
      }}>
        <Tab.Screen name="the math" component={MathScreen} options={{ tabBarIcon: ({ color, focused }) => <View style={ti(focused)}><Calculator color={color} size={18} /></View> }} />
        <Tab.Screen name="plan" component={GamePlanScreen} options={{ tabBarIcon: ({ color, focused }) => <View style={ti(focused)}><Map color={color} size={18} /></View> }} />
        <Tab.Screen name="what if" component={WhatIfScreen} options={{ tabBarIcon: ({ color, focused }) => <View style={ti(focused)}><LayoutGrid color={color} size={18} /></View> }} />
        <Tab.Screen name="bs filter" component={BSFilterScreen} options={{ tabBarIcon: ({ color, focused }) => <View style={ti(focused)}><BookOpen color={color} size={18} /></View> }} />
        <Tab.Screen name="settings" component={SettingsScreen} options={{ tabBarIcon: ({ color, focused }) => <View style={ti(focused)}><Settings color={color} size={18} /></View> }} />
      </Tab.Navigator>

      <PaywallModal visible={showPay} onClose={() => sPay(false)} onPurchase={() => { setPro(true); sPay(false); }} />
    </View>
  );
}
