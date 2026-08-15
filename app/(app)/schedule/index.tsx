import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/lib/colors';

export default function ScheduleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule</Text>
      <Text style={styles.subtitle}>Your weekly grid will show up here.</Text>
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
