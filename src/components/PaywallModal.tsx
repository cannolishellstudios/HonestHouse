import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator,
} from 'react-native';
import { Star, BookOpen, Shield, BarChart2, DollarSign, Calculator } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/store';
import { PlanId } from '../services/revenueCat';

interface Plan {
  id: PlanId;
  label: string;
  price: string;
  perMonth: string;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
}

const PLANS: Plan[] = [
  { id: 'monthly',  label: 'monthly',  price: '$2.99/mo',  perMonth: 'billed monthly' },
  { id: 'yearly',   label: 'yearly',   price: '$14.99/yr', perMonth: '$1.25/mo — save 58%',       badge: 'most popular',   badgeColor: colors.green,  badgeBg: colors.greenBg },
  { id: 'lifetime', label: 'lifetime', price: '$49.99',    perMonth: 'one-time · yours forever',   badge: 'never pay again', badgeColor: colors.purple, badgeBg: colors.purpleBg },
];

const FEATS = [
  { I: BookOpen,   c: colors.purple, l: '50 myth-busters' },
  { I: BarChart2,  c: colors.blue,   l: 'what-if matrix' },
  { I: Shield,     c: colors.green,  l: 'negotiation scripts' },
  { I: DollarSign, c: colors.orange, l: 'rent vs. buy calc' },
  { I: Calculator, c: colors.yellow, l: 'hidden costs checklist' },
];

interface Props { visible: boolean; onClose: () => void; }

export function PaywallModal({ visible, onClose }: Props) {
  const { triggerPurchase, isPurchasing } = useAppStore();
  const [selected, setSelected] = useState<PlanId>('yearly');

  const handlePurchase = async () => {
    const ok = await triggerPurchase(selected);
    if (ok) onClose();
  };

  const selectedPlan = PLANS.find(p => p.id === selected)!;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 28, borderTopRightRadius: 28,
              padding: 22, paddingBottom: 36, alignItems: 'center',
            }}>
              {/* drag pill */}
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 18 }} />

              {/* headline */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Star size={20} color={colors.purple} fill={colors.purple} />
                <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>honest house pro</Text>
              </View>
              <Text style={{ color: colors.textMed, fontSize: 12, marginBottom: 14, textAlign: 'center' }}>
                everything you need to not get screwed buying a house
              </Text>

              {/* compact feature pills */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16, justifyContent: 'center' }}>
                {FEATS.map((f, i) => (
                  <View key={i} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 5,
                    backgroundColor: f.c + '15', borderRadius: 100,
                    paddingHorizontal: 10, paddingVertical: 5,
                    borderWidth: 1, borderColor: f.c + '30',
                  }}>
                    <f.I size={11} color={f.c} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>{f.l}</Text>
                  </View>
                ))}
              </View>

              {/* plan selector */}
              <View style={{ width: '100%', gap: 8, marginBottom: 14 }}>
                {PLANS.map(plan => {
                  const isSelected = selected === plan.id;
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      onPress={() => setSelected(plan.id)}
                      activeOpacity={0.8}
                      style={{
                        flexDirection: 'row', alignItems: 'center',
                        borderRadius: 14, padding: 13,
                        borderWidth: 2,
                        borderColor: isSelected ? colors.purple : colors.border,
                        backgroundColor: isSelected ? colors.purpleBg : '#fff',
                        borderBottomWidth: isSelected ? 3 : 2,
                        borderBottomColor: isSelected ? colors.purpleDark : colors.border,
                      }}>
                      <View style={{
                        width: 20, height: 20, borderRadius: 10,
                        borderWidth: 2,
                        borderColor: isSelected ? colors.purple : colors.border,
                        backgroundColor: isSelected ? colors.purple : 'transparent',
                        alignItems: 'center', justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        {isSelected && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', textTransform: 'capitalize', color: isSelected ? colors.purpleDark : colors.text }}>
                          {plan.label}
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.textMed, marginTop: 1 }}>{plan.perMonth}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 3 }}>
                        <Text style={{ fontSize: 15, fontWeight: '900', color: isSelected ? colors.purpleDark : colors.text }}>
                          {plan.price}
                        </Text>
                        {plan.badge && (
                          <View style={{ backgroundColor: plan.badgeBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 }}>
                            <Text style={{ fontSize: 9, fontWeight: '800', color: plan.badgeColor }}>
                              {plan.badge.toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* CTA */}
              <TouchableOpacity
                onPress={handlePurchase}
                activeOpacity={0.9}
                disabled={isPurchasing}
                style={{
                  width: '100%', padding: 16, borderRadius: 16,
                  backgroundColor: colors.purple, alignItems: 'center',
                  borderBottomWidth: 4, borderBottomColor: colors.purpleDark,
                  marginBottom: 8, opacity: isPurchasing ? 0.7 : 1,
                }}>
                {isPurchasing
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>get pro · {selectedPlan.price}</Text>
                }
              </TouchableOpacity>

              <Text style={{ color: colors.textMed, fontSize: 11, marginBottom: 10, textAlign: 'center' }}>
                {selected === 'lifetime'
                  ? 'one-time payment · yours forever · no recurring charges'
                  : 'cancel anytime · managed through the App Store'}
              </Text>

              <TouchableOpacity
                onPress={onClose}
                style={{ width: '100%', padding: 11, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center' }}>
                <Text style={{ color: colors.textMed, fontSize: 13, fontWeight: '700' }}>maybe later</Text>
              </TouchableOpacity>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}