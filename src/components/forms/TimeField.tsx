import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Input } from '@/components/ui/Input';
import { theme } from '@/lib/colors';
import { formatTime12h } from '@/lib/time';

interface TimeFieldProps {
  label: string;
  value: string; // "HH:MM", 24-hour
  onChange: (value: string) => void;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function TimeField({ label, value, onChange }: TimeFieldProps) {
  const [draft, setDraft] = useState(value);

  const isValid = TIME_PATTERN.test(draft);

  const handleChangeText = (text: string) => {
    setDraft(text);
    if (TIME_PATTERN.test(text)) {
      onChange(text);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label={label}
        placeholder="14:30"
        value={draft}
        onChangeText={handleChangeText}
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        error={!isValid ? 'Use 24-hour HH:MM, e.g. 14:30' : undefined}
      />
      {isValid ? <Text style={styles.preview}>{formatTime12h(draft)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 4,
  },
  preview: {
    color: theme.textMuted,
    fontSize: 12,
  },
});
