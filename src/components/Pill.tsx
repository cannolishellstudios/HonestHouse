import React from 'react';
import { View, Text } from 'react-native';

interface Props { text: string; color: string; bg: string; }

export function Pill({ text, color, bg }: Props) {
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1.5, borderColor: color + '40' }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color }}>{text}</Text>
    </View>
  );
}
