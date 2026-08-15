import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { DayToggleRow } from '@/components/forms/DayToggleRow';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { theme } from '@/lib/colors';
import { supabase } from '@/lib/supabase';
import type { DayOfWeek } from '@/types/domain';

const REMINDER_OPTIONS = [5, 10, 15, 30];

export default function SettingsScreen() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [activeDays, setActiveDays] = useState<DayOfWeek[]>([]);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '');
      setUniversity(profile.university ?? '');
      setActiveDays(profile.activeDays);
    }
  }, [profile]);

  if (!profile) return null;

  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await updateProfile({ fullName: fullName.trim(), university: university.trim() });
      setSavedMessage('Saved');
      setTimeout(() => setSavedMessage(null), 1500);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const saveActiveDays = async (days: DayOfWeek[]) => {
    if (days.length === 0) return;
    setActiveDays(days);
    await updateProfile({ activeDays: days });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Signed in as @{profile.username}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Input label="Full name" value={fullName} onChangeText={setFullName} />
        <Input label="University" value={university} onChangeText={setUniversity} />
        {savedMessage ? <Text style={styles.saved}>{savedMessage}</Text> : null}
        <Button title="Save profile" variant="secondary" onPress={saveProfile} loading={isSavingProfile} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Week days</Text>
        <Text style={styles.hint}>Which days does your university hold classes?</Text>
        <DayToggleRow selected={activeDays} onChange={saveActiveDays} multiSelect />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Class reminders</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Enabled</Text>
          <Switch
            value={profile.notificationsEnabled}
            onValueChange={(value) => updateProfile({ notificationsEnabled: value })}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
        {profile.notificationsEnabled ? (
          <View style={styles.reminderRow}>
            {REMINDER_OPTIONS.map((minutes) => (
              <Pressable
                key={minutes}
                onPress={() => updateProfile({ reminderMinutesBefore: minutes })}
                style={[styles.reminderPill, profile.reminderMinutesBefore === minutes && styles.reminderPillActive]}
              >
                <Text
                  style={[
                    styles.reminderPillText,
                    profile.reminderMinutesBefore === minutes && styles.reminderPillTextActive,
                  ]}
                >
                  {minutes} min
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <Button title="Manage semesters" variant="secondary" onPress={() => router.push('/(app)/semesters')} />
      <Button title="Sign out" variant="danger" onPress={() => supabase.auth.signOut()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
    backgroundColor: theme.background,
    flexGrow: 1,
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
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  hint: {
    color: theme.textMuted,
    fontSize: 13,
  },
  saved: {
    color: theme.success,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    color: theme.text,
    fontSize: 15,
  },
  reminderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reminderPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  reminderPillActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  reminderPillText: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  reminderPillTextActive: {
    color: theme.primaryText,
  },
});
