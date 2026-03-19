import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Star, BookOpen, Shield, Flame, TrendingUp, Home, Zap } from 'lucide-react-native';
import { colors } from '../theme/colors';

const FEATS = [
  { I: BookOpen, c: colors.purple, l: '30 myth-busters' },
  { I: Shield, c: colors.green, l: 'negotiation scripts' },
  { I: Flame, c: colors.red, l: 'hidden costs checklist' },
  { I: TrendingUp, c: colors.blue, l: 'rate comparison' },
  { I: Home, c: colors.yellow, l: 'rent vs. buy calc' },
  { I: Zap, c: colors.orange, l: 'new tools monthly' },
];

interface Props { visible: boolean; onClose: () => void; onPurchase?: () => void; }

export function PaywallModal({ visible, onClose, onPurchase }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, alignItems: 'center' }}>
              <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: colors.purpleBg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Star size={26} color={colors.purple} fill={colors.purple} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>honest house pro</Text>
              <Text style={{ color: colors.textMed, fontSize: 13, marginTop: 4, marginBottom: 16 }}>unlocks instantly</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16, width: '100%' }}>
                {FEATS.map((f, i) => (
                  <View key={i} style={{ width: '48%', backgroundColor: colors.surface, borderRadius: 10, padding: 10, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <f.I size={14} color={f.c} />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: colors.text }}>{f.l}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity onPress={onPurchase || onClose} activeOpacity={0.9}
                style={{ width: '100%', padding: 14, borderRadius: 14, backgroundColor: colors.purple, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: colors.purpleDark, marginBottom: 4 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>start 7-day free trial</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.textMed, fontSize: 13, fontWeight: '700', marginBottom: 10 }}>then $2.99/mo · cancel anytime</Text>
              <TouchableOpacity onPress={onClose} style={{ width: '100%', padding: 10, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center' }}>
                <Text style={{ color: colors.textMed, fontSize: 13, fontWeight: '700' }}>maybe later</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
