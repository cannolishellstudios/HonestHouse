import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Mail, Shield, FileText, Star, RotateCcw, ChevronRight } from 'lucide-react-native';
import { useAppStore } from '../store/store';
import { colors } from '../theme/colors';
import { ChunkyCard, Pill, PaywallModal } from '../components';

export default function SettingsScreen() {
  const store = useAppStore();
  const [showPay, sPay] = useState(false);

  const row = (icon: React.ReactNode, label: string, sub: string, onPress: () => void) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.surface }}>
      {icon}
      <View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{label}</Text><Text style={{ color: colors.textLight, fontSize: 12 }}>{sub}</Text></View>
      <ChevronRight size={18} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>settings</Text>
      </View>

      {/* PRO STATUS */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <ChunkyCard color={store.isPro ? colors.green : colors.purple} shadowColor={store.isPro ? colors.greenDark : colors.purpleDark}
          onPress={store.isPro ? undefined : () => sPay(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: store.isPro ? colors.greenBg : colors.purpleBg, alignItems: 'center', justifyContent: 'center' }}>
              <Star size={22} color={store.isPro ? colors.green : colors.purple} fill={store.isPro ? colors.green : colors.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800' }}>{store.isPro ? 'you\'re a pro member' : 'upgrade to pro'}</Text>
              <Text style={{ color: colors.textMed, fontSize: 12 }}>{store.isPro ? '200+ myths, scripts, checklists & tools' : '$2.99/mo · less than a bad coffee'}</Text>
            </View>
            {!store.isPro && <Pill text="upgrade" color={colors.purple} bg={colors.purpleBg} />}
          </View>
        </ChunkyCard>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <ChunkyCard>
          {row(
            <Mail size={20} color={colors.blue} />,
            'contact us',
            'cannolishellstudios@gmail.com',
            () => Linking.openURL('mailto:cannolishellstudios@gmail.com')
          )}
          {row(
            <FileText size={20} color={colors.textMed} />,
            'privacy policy',
            'how we handle your data (we don\'t sell it)',
            () => Alert.alert('privacy policy', 'HonestHouse does not collect, store, or sell any personal data. all calculations happen on your device. we don\'t even have a server. your numbers are yours.\n\nfor questions: cannolishellstudios@gmail.com')
          )}
          {row(
            <FileText size={20} color={colors.textMed} />,
            'terms of use',
            'the legal stuff',
            () => Alert.alert('terms of use', 'HonestHouse provides educational estimates only. we are not financial advisors, lenders, or realtors. always consult a qualified professional before making financial decisions. calculations are estimates and may not reflect actual loan terms.\n\n© 2026 Cannoli Shell Studios')
          )}
          {row(
            <Shield size={20} color={colors.green} />,
            'manage subscription',
            store.isPro ? 'manage through app store' : 'no active subscription',
            () => {
              if (store.isPro) {
                Linking.openURL('https://apps.apple.com/account/subscriptions');
              } else {
                sPay(true);
              }
            }
          )}
          {row(
            <RotateCcw size={20} color={colors.red} />,
            'restore purchases',
            'already paid? restore here',
            () => Alert.alert('restore', 'in the production app, this will check RevenueCat for existing purchases and restore your pro access.')
          )}
        </ChunkyCard>

        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <Text style={{ color: colors.textLight, fontSize: 12, fontWeight: '700' }}>honesthouseapp v1.0.0</Text>
          <Text style={{ color: colors.textLight, fontSize: 11, marginTop: 4 }}>made by cannoli shell studios</Text>
          <Text style={{ color: colors.textLight, fontSize: 11, marginTop: 2 }}>built by a millennial, for millennials</Text>
        </View>
      </View>

      <PaywallModal visible={showPay} onClose={() => sPay(false)} onPurchase={() => { store.setPro(true); sPay(false); }} />
    </ScrollView>
  );
}
