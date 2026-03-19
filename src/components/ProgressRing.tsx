import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';

interface Props { value: number; max: number; size?: number; strokeWidth?: number; color?: string; }

export function ProgressRing({ value, max, size = 88, strokeWidth = 9, color = colors.green }: Props) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const p = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View style={{ width: size, height: size, transform: [{ rotate: '-90deg' }] }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.surface} strokeWidth={strokeWidth} />
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={`${c}`} strokeDashoffset={c * (1 - p)} strokeLinecap="round" />
      </Svg>
    </View>
  );
}
