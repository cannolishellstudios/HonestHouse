import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { colors } from '../theme/colors';

interface Props { visible: boolean; label: string; value: number; prefix?: string; onSave: (v: string) => void; onClose: () => void; }

export function InputModal({ visible, label, value, prefix = '$', onSave, onClose }: Props) {
  const [v, sV] = useState('');
  const ref = useRef<TextInput>(null);
  useEffect(() => { if (visible) { sV(value === 0 ? '' : String(value)); setTimeout(() => ref.current?.focus(), 300); } }, [visible, value]);
  const save = () => { onSave(v); Keyboard.dismiss(); onClose(); };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 20 }} />
                <Text style={{ color: colors.textMed, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>{label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  {prefix ? <Text style={{ color: colors.textLight, fontSize: 36, fontWeight: '800' }}>{prefix}</Text> : null}
                  <TextInput ref={ref} style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, borderRadius: 14, color: colors.text, fontSize: 36, fontWeight: '900', padding: 12, textAlign: 'center' }}
                    keyboardType="decimal-pad" value={v} onChangeText={sV} onSubmitEditing={save} placeholder="0" placeholderTextColor={colors.textLight} returnKeyType="done" />
                </View>
                <TouchableOpacity onPress={save} activeOpacity={0.9} style={{ padding: 16, borderRadius: 14, backgroundColor: colors.green, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: colors.greenDark }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>done</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
