import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { useProfile } from '@/hooks/useProfile';
import { theme } from '@/lib/colors';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const { data: profile } = useProfile();

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View>
          <Text style={styles.title}>Settings</Text>
          {profile ? <Text style={styles.subtitle}>Signed in as @{profile.username}</Text> : null}
        </View>
        <Button title="Manage semesters" variant="secondary" onPress={() => router.push('/(app)/semesters')} />
      </View>

      <Button title="Sign out" variant="danger" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 24,
    justifyContent: 'space-between',
  },
  top: {
    gap: 16,
  },
  title: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 15,
    marginTop: 4,
  },
});
