import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/lib/colors';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    color: theme.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
