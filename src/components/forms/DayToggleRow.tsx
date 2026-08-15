import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/lib/colors';
import type { DayOfWeek } from '@/types/domain';
import { ALL_DAYS, DAY_SHORT_LABELS } from '@/types/domain';

interface DayToggleRowProps {
  selected: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
  multiSelect?: boolean;
}

export function DayToggleRow({ selected, onChange, multiSelect = true }: DayToggleRowProps) {
  const toggle = (day: DayOfWeek) => {
    if (!multiSelect) {
      onChange([day]);
      return;
    }
    onChange(selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day].sort());
  };

  return (
    <View style={styles.row}>
      {ALL_DAYS.map((day) => {
        const isSelected = selected.includes(day);
        return (
          <Pressable key={day} onPress={() => toggle(day)} style={[styles.pill, isSelected && styles.pillSelected]}>
            <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{DAY_SHORT_LABELS[day].slice(0, 2)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  pillText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: theme.primaryText,
  },
});
