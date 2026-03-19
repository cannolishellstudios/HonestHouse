import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChunkyCard } from './ChunkyCard';
import { colors } from '../theme/colors';

interface Item { id: string; label: string; val: number; }
interface Props { title: string; items: Item[]; onEdit: (id: string, label: string, val: number) => void; color: string; bgColor: string; shadowColor: string; total: number; icon: React.ReactNode; }

const fmt = (n: number) => Math.round(n).toLocaleString();

export function ExpandableList({ title, items, onEdit, color, bgColor, shadowColor, total, icon }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <ChunkyCard color={color} shadowColor={shadowColor} onPress={!open ? () => setOpen(true) : undefined}>
      <TouchableOpacity onPress={() => setOpen(!open)} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: bgColor, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '800' }}>{title}</Text>
          <Text style={{ color: colors.textLight, fontSize: 11 }}>{open ? 'tap a line to edit' : 'tap to break it down'}</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>${fmt(total)}</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ marginTop: 12, borderTopWidth: 2, borderTopColor: colors.surface, paddingTop: 10 }}>
          {items.map(item => (
            <TouchableOpacity key={item.id} onPress={() => onEdit(item.id, item.label, item.val)} activeOpacity={0.7}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.surface }}>
              <Text style={{ color: colors.textMed, fontSize: 13, fontWeight: '700', flex: 1 }}>{item.label}</Text>
              <View style={{ backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: item.val > 0 ? colors.text : colors.textLight }}>${fmt(item.val)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ChunkyCard>
  );
}
