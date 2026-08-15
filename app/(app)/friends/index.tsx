import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/lib/colors';

export default function FriendsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>
      <Text style={styles.subtitle}>Add friends to see when you&apos;re free together.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 24,
    gap: 8,
    justifyContent: 'center',
  },
  title: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 15,
  },
});
