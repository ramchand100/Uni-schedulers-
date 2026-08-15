import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateSemester, useSemesters, useSetActiveSemester } from '@/hooks/useSemesters';
import { theme } from '@/lib/colors';
import type { SemesterTerm } from '@/types/domain';

const TERMS: SemesterTerm[] = ['Spring', 'Summer', 'Fall'];
const CURRENT_YEAR = new Date().getFullYear();

export default function SemestersScreen() {
  const { data: semesters, isLoading } = useSemesters();
  const setActive = useSetActiveSemester();
  const createSemester = useCreateSemester();

  const [isAdding, setIsAdding] = useState(false);
  const [term, setTerm] = useState<SemesterTerm>('Fall');
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setError(null);
    const parsedYear = Number(year);
    if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      setError('Enter a valid year');
      return;
    }
    createSemester.mutate(
      { name: `${term} ${parsedYear}`, term, year: parsedYear },
      {
        onSuccess: () => setIsAdding(false),
        onError: (err) => setError(err instanceof Error ? err.message : 'Something went wrong'),
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Semesters</Text>

      {!isLoading &&
        semesters?.map((semester) => (
          <Pressable
            key={semester.id}
            style={[styles.card, semester.isActive && styles.cardActive]}
            onPress={() => !semester.isActive && setActive.mutate(semester.id)}
          >
            <Text style={styles.cardTitle}>{semester.name}</Text>
            {semester.isActive ? <Text style={styles.activeLabel}>Active</Text> : <Text style={styles.switchLabel}>Tap to switch</Text>}
          </Pressable>
        ))}

      {isAdding ? (
        <View style={styles.addForm}>
          <View style={styles.termRow}>
            {TERMS.map((t) => (
              <Pressable key={t} onPress={() => setTerm(t)} style={[styles.termPill, term === t && styles.termPillActive]}>
                <Text style={[styles.termPillText, term === t && styles.termPillTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>
          <Input label="Year" keyboardType="number-pad" value={year} onChangeText={setYear} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Create semester" onPress={handleCreate} loading={createSemester.isPending} />
          <Button title="Cancel" variant="secondary" onPress={() => setIsAdding(false)} />
        </View>
      ) : (
        <Button title="+ New semester" variant="secondary" onPress={() => setIsAdding(true)} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
    backgroundColor: theme.background,
    flexGrow: 1,
  },
  title: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  card: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActive: {
    borderColor: theme.primary,
  },
  cardTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  activeLabel: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  switchLabel: {
    color: theme.textMuted,
    fontSize: 12,
  },
  addForm: {
    gap: 12,
    marginTop: 8,
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
  error: {
    color: theme.danger,
    fontSize: 14,
  },
});
