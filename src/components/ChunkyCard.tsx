import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  color?: string;
  shadowColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ChunkyCard({ children, color, shadowColor, onPress, style }: Props) {
  const bc = color || colors.border;
  const sc = shadowColor || colors.border;
  const s: ViewStyle[] = [{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 2, borderColor: bc, borderBottomWidth: 4, borderBottomColor: sc }, style as ViewStyle];
  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={s}>{children}</TouchableOpacity>;
  return <View style={s}>{children}</View>;
}
