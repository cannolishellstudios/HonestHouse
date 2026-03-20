import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Linking, Alert, ActivityIndicator,
} from 'react-native';
import {
  Mail, Shield, FileText, Star, RotateCcw, ChevronRight,
  MessageSquare, DollarSign, AlertTriangle,
} from 'lucide-react-native';
import { useAppStore } from '../store/store';
import { colors } from '../theme/colors';
import { ChunkyCard, Pill, PaywallModal } from '../components';
import NegotiationScreen from './NegotiationScreen';
import RentVsBuyScreen from './RentVsBuyScreen';
import HiddenCostsScreen from './HiddenCostsScreen';

type ProView = null | 'negotiation' | 'rentvsbuy' | 'hiddencosts';

// ─── simple back header ───────────────────────────────────────────────────────
function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 2, borderBottomColor: colors.border,
      backgroundColor: '#fff',
    }}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.blue, marginRight: 16 }}>← back</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>{title}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const store = useAppStore();
  const [showPay, sPay]      = useState(false);
  const [proView, setProView] = useState<ProView>(null);

  // ── sub-screen routing ──────────────────────────────────────────────────────
  if (proView === 'negotiation') {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <SubHeader title="negotiation scripts" onBack={() => setProView(null)} />
        <NegotiationScreen onUpgrade={() => sPay(true)} />
        <PaywallModal visible={showPay} onClose={() => sPay(false)} />
      </View>
    );
  }

  if (proView === 'rentvsbuy') {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <SubHeader title="rent vs. buy calculator" onBack={() => setProView(null)} />
        <RentVsBuyScreen onUpgrade={() => sPay(true)} />
        <PaywallModal visible={showPay} onClose={() => sPay(false)} />
      </View>
    );
  }

  if (proView === 'hiddencosts') {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <SubHeader title="hidden costs checklist" onBack={() => setProView(null)} />
        <HiddenCostsScreen onUpgrade={() => sPay(true)} />
        <PaywallModal visible={showPay} onClose={() => sPay(false)} />
      </View>
    );
  }

  // ── helpers ─────────────────────────────────────────────────────────────────
  const handleRestore = async () => {
    const ok = await store.triggerRestore();
    Alert.alert(
      ok ? 'restored!' : 'nothing found',
      ok
        ? 'pro is now active on your account.'
        : 'no previous purchases found.\n\ncannolishellstudios@gmail.com',
    );
  };

  // ── main settings view ──────────────────────────────────────────────────────
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>settings</Text>
      </View>

      {/* ── Pro status card ── */}
      <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
        <ChunkyCard
          color={store.isPro ? colors.green : colors.purple}
          shadowColor={store.isPro ? colors.greenDark : colors.purpleDark}
          onPress={store.isPro ? undefined : () => sPay(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{
              width: 44, height: 44, borderRadius: 12,
              backgroundColor: store.isPro ? colors.greenBg : colors.purpleBg,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Star size={22}
                color={store.isPro ? colors.green : colors.purple}
                fill={store.isPro ? colors.green : colors.purple}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800' }}>
                {store.isPro ? "you're a pro member" : 'upgrade to pro'}
              </Text>
              <Text style={{ color: colors.textMed, fontSize: 12 }}>
                {store.isPro ? '50 myths, matrix, scripts & more' : 'from $2.99/mo'}
              </Text>
            </View>
            {!store.isPro && <Pill text="upgrade" color={colors.purple} bg={colors.purpleBg} />}
          </View>
        </ChunkyCard>
      </View>

      {/* ── Pro tools — each row is its own standalone TouchableOpacity ── */}
      <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          pro tools
        </Text>

        {/* Negotiation Scripts */}
        <TouchableOpacity
          onPress={() => store.isPro ? setProView('negotiation') : sPay(true)}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 14,
            backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8,
            borderWidth: 2, borderColor: colors.border,
            borderBottomWidth: 3, borderBottomColor: colors.border,
          }}>
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.greenBg, alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={20} color={colors.green} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>negotiation scripts</Text>
            <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>word-for-word what to say</Text>
          </View>
          {store.isPro
            ? <ChevronRight size={18} color={colors.textLight} />
            : <View style={{ backgroundColor: colors.purpleBg, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: colors.purple }}>PRO</Text>
              </View>
          }
        </TouchableOpacity>

        {/* Rent vs Buy */}
        <TouchableOpacity
          onPress={() => store.isPro ? setProView('rentvsbuy') : sPay(true)}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 14,
            backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8,
            borderWidth: 2, borderColor: colors.border,
            borderBottomWidth: 3, borderBottomColor: colors.border,
          }}>
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.orangeBg, alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={20} color={colors.orange} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>rent vs. buy calculator</Text>
            <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>find out which actually wins</Text>
          </View>
          {store.isPro
            ? <ChevronRight size={18} color={colors.textLight} />
            : <View style={{ backgroundColor: colors.purpleBg, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: colors.purple }}>PRO</Text>
              </View>
          }
        </TouchableOpacity>

        {/* Hidden Costs */}
        <TouchableOpacity
          onPress={() => store.isPro ? setProView('hiddencosts') : sPay(true)}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 14,
            backgroundColor: '#fff', borderRadius: 14, padding: 14,
            borderWidth: 2, borderColor: colors.border,
            borderBottomWidth: 3, borderBottomColor: colors.border,
          }}>
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.redBg, alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} color={colors.red} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>hidden costs checklist</Text>
            <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>24 costs that blindside buyers</Text>
          </View>
          {store.isPro
            ? <ChevronRight size={18} color={colors.textLight} />
            : <View style={{ backgroundColor: colors.purpleBg, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: colors.purple }}>PRO</Text>
              </View>
          }
        </TouchableOpacity>
      </View>

      {/* ── General settings ── */}
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textMed, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          general
        </Text>

        {[
          {
            icon: <Mail size={20} color={colors.blue} />,
            label: 'contact us',
            sub: 'cannolishellstudios@gmail.com',
            onPress: () => Linking.openURL('mailto:cannolishellstudios@gmail.com'),
          },
          {
            icon: <FileText size={20} color={colors.textMed} />,
            label: 'privacy policy',
            sub: "we don't collect or sell your data",
            onPress: () => Alert.alert('privacy policy', 'HonestHouse does not collect, store, or sell any personal data. all calculations happen on your device.\n\ncannolishellstudios@gmail.com'),
          },
          {
            icon: <FileText size={20} color={colors.textMed} />,
            label: 'terms of use',
            sub: 'educational estimates only',
            onPress: () => Alert.alert('terms of use', 'HonestHouse provides educational estimates only. not a licensed financial advisor, lender, or realtor.\n\n© 2026 Cannoli Shell Studios'),
          },
          {
            icon: <Shield size={20} color={store.isPro ? colors.green : colors.textMed} />,
            label: 'manage subscription',
            sub: store.isPro ? 'opens App Store subscription settings' : 'no active subscription',
            onPress: () => store.isPro
              ? Linking.openURL('https://apps.apple.com/account/subscriptions')
              : sPay(true),
          },
          {
            icon: <RotateCcw size={20} color={colors.red} />,
            label: 'restore purchases',
            sub: 'already paid? restore here',
            onPress: handleRestore,
            trailing: store.isRestoring ? <ActivityIndicator size="small" color={colors.textLight} /> : undefined,
          },
        ].map((item, i, arr) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 14,
              paddingVertical: 14,
              borderBottomWidth: i < arr.length - 1 ? 1 : 0,
              borderBottomColor: colors.surface,
            }}>
            {item.icon}
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{item.label}</Text>
              <Text style={{ color: colors.textLight, fontSize: 12 }}>{item.sub}</Text>
            </View>
            {item.trailing ?? <ChevronRight size={18} color={colors.textLight} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 28, alignItems: 'center', paddingBottom: 10 }}>
        <Text style={{ color: colors.textLight, fontSize: 12, fontWeight: '700' }}>honesthouseapp v1.0.0</Text>
        <Text style={{ color: colors.textLight, fontSize: 11, marginTop: 4 }}>made by cannoli shell studios</Text>
        <Text style={{ color: colors.textLight, fontSize: 11, marginTop: 2 }}>built by a millennial, for millennials</Text>
      </View>

      <PaywallModal visible={showPay} onClose={() => sPay(false)} />
    </ScrollView>
  );
}