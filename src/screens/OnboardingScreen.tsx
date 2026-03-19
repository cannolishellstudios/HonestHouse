import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Calculator, Target, Zap } from 'lucide-react-native';
import { colors } from '../theme/colors';

const PAGES = [
  { t: 'buying a house is\nconfusing on purpose', s: "the real estate industry profits when you don't understand the math. we're here to fix that.", c: colors.green, bg: colors.greenBg, I: Home },
  { t: 'we do one thing:\nthe actual math', s: 'no jargon, no "talk to an advisor." your real numbers and what they mean.', c: colors.blue, bg: colors.blueBg, I: Calculator },
  { t: "set a goal and\nwe'll get you there", s: "can't afford your dream house yet? we'll build a step-by-step game plan to close the gap.", c: colors.purple, bg: colors.purpleBg, I: Target },
  { t: 'ready?\ntakes about 60 seconds', s: 'no signup. no selling your data. just math.', c: colors.yellow, bg: colors.yellowBg, I: Zap },
];

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [step, sS] = useState(0);
  const p = PAGES[step];
  return (
    <View style={styles.c}>
      <View style={[styles.icon, { backgroundColor: p.bg, borderColor: p.c }]}><p.I size={40} color={p.c} /></View>
      <Text style={styles.t}>{p.t}</Text>
      <Text style={styles.s}>{p.s}</Text>
      <View style={styles.dots}>{PAGES.map((_, i) => <View key={i} style={[styles.dot, { width: step === i ? 24 : 8, backgroundColor: step === i ? p.c : colors.border }]} />)}</View>
      <TouchableOpacity onPress={() => step < 3 ? sS(step + 1) : onDone()} activeOpacity={0.9}
        style={[styles.btn, { backgroundColor: p.c, borderBottomColor: p.c + '88' }]}>
        <Text style={styles.btnT}>{step < 3 ? 'next' : "let's go"}</Text>
      </TouchableOpacity>
      {step > 0 && <TouchableOpacity onPress={() => sS(step - 1)} style={{ marginTop: 10 }}><Text style={{ color: colors.textLight, fontSize: 14, fontWeight: '700' }}>back</Text></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 },
  icon: { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 3, marginBottom: 24 },
  t: { fontSize: 24, fontWeight: '900', color: colors.text, textAlign: 'center', lineHeight: 32, maxWidth: 320, marginBottom: 12 },
  s: { fontSize: 15, color: colors.textMed, textAlign: 'center', lineHeight: 24, maxWidth: 300, marginBottom: 32 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dot: { height: 8, borderRadius: 4 },
  btn: { width: '100%', maxWidth: 300, padding: 16, borderRadius: 14, alignItems: 'center', borderBottomWidth: 4 },
  btnT: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
