import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput,
  TouchableOpacity, TouchableWithoutFeedback,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  label: string;
  value: number;
  prefix?: string;
  onSave: (v: string) => void;
  onClose: () => void;
}

export function InputModal({ visible, label, value, prefix = '$', onSave, onClose }: Props) {
  const [v, setV] = useState('');

  useEffect(() => {
    if (visible) {
      setV(value === 0 ? '' : String(value));
    }
  }, [visible, value]);

  const save = () => {
    onSave(v);
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            style={{ width: '100%' }}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={{
                backgroundColor: '#fff',
                borderTopLeftRadius: 24, borderTopRightRadius: 24,
                padding: 24, paddingBottom: 32,
              }}>
                {/* handle */}
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 20 }} />

                {/* label */}
                <Text style={{ color: colors.textMed, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                  {label}
                </Text>

                {/* input */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  {prefix ? (
                    <Text style={{ color: colors.textLight, fontSize: 32, fontWeight: '800' }}>{prefix}</Text>
                  ) : null}
                  <TextInput
                    autoFocus
                    style={{
                      flex: 1,
                      backgroundColor: colors.surface,
                      borderWidth: 2, borderColor: colors.border,
                      borderRadius: 14,
                      color: colors.text,
                      fontSize: 34, fontWeight: '900',
                      padding: 12,
                      textAlign: 'center',
                    }}
                    keyboardType="decimal-pad"
                    value={v}
                    onChangeText={setV}
                    onSubmitEditing={save}
                    placeholder="0"
                    placeholderTextColor={colors.textLight}
                    returnKeyType="done"
                  />
                </View>

                {/* done button — required on Android where keyboard done key is unreliable */}
                <TouchableOpacity
                  onPress={save}
                  activeOpacity={0.9}
                  style={{
                    backgroundColor: colors.green,
                    borderRadius: 14, padding: 16,
                    alignItems: 'center',
                    borderBottomWidth: 4, borderBottomColor: colors.greenDark,
                  }}>
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