import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateSemester } from '@/hooks/useSemesters';
import { useUpdateProfile } from '@/hooks/useProfile';
import { theme } from '@/lib/colors';
import type { SemesterTerm } from '@/types/domain';

const TERMS: SemesterTerm[] = ['Spring', 'Summer', 'Fall'];
const CURRENT_YEAR = new Date().getFullYear();

export default function CreateFirstSemesterScreen() {
  const createSemester = useCreateSemester();
  const updateProfile = useUpdateProfile();
  const [term, setTerm] = useState<SemesterTerm>('Fall');
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    setSubmitError(null);
    const parsedYear = Number(year);
    if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      setSubmitError('Enter a valid year');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSemester.mutateAsync({ name: `${term} ${parsedYear}`, term, year: parsedYear });
      await updateProfile({ onboardingCompleted: true });
      // RootNavigator picks up the refreshed profile and routes into (app).
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your current semester</Text>
        <Text style={styles.subtitle}>You can add more semesters and switch between them later.</Text>

        <View style={styles.form}>
          <View style={styles.termRow}>
            {TERMS.map((t) => (
              <Pressable
                key={t}
                onPress={() => setTerm(t)}
                style={[styles.termPill, term === t && styles.termPillActive]}
              >
                <Text style={[styles.termPillText, term === t && styles.termPillTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Input label="Year" keyboardType="number-pad" value={year} onChangeText={setYear} />

          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

          <Button title="Start scheduling" onPress={onSubmit} loading={isSubmitting} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  title: {
    color: theme.text,
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 15,
  },
  form: {
    gap: 16,
  },
  termRow: {
    flexDirection: 'row',
    gap: 10,
  },
  termPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  termPillActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  termPillText: {
    color: theme.textMuted,
    fontWeight: '600',
  },
  termPillTextActive: {
    color: theme.primaryText,
  },
  submitError: {
    color: theme.danger,
    fontSize: 14,
  },
});
