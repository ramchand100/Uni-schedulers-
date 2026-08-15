import { StyleSheet, Text, View } from 'react-native';

import { useProfile } from '@/hooks/useProfile';
import { theme } from '@/lib/colors';

export default function TodayScreen() {
  const { data: profile } = useProfile();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome{profile?.fullName ? `, ${profile.fullName}` : ''}</Text>
      <Text style={styles.subtitle}>Today&apos;s classes will show up here.</Text>
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
