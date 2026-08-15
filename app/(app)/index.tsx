import { FlatList, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useProfile } from '@/hooks/useProfile';
import { useTodayClasses } from '@/hooks/useTodayClasses';
import { theme } from '@/lib/colors';
import { formatTime12h } from '@/lib/time';
import { DAY_LABELS } from '@/types/domain';

export default function TodayScreen() {
  const { data: profile } = useProfile();
  const { data: items, isLoading } = useTodayClasses();
  const today = new Date();
  const todayLabel = DAY_LABELS[today.getDay() as keyof typeof DAY_LABELS];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{`${todayLabel}${profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}`}</Text>

      {isLoading ? (
        <Spinner />
      ) : !items || items.length === 0 ? (
        <EmptyState title="No classes today" description="Enjoy your free day, or check the Schedule tab to plan ahead." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.session.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.courseCode ? `${item.courseCode} · ${item.courseTitle}` : item.courseTitle}</Text>
                <Text style={styles.rowMeta}>
                  {formatTime12h(item.session.startTime)} – {formatTime12h(item.session.endTime)}
                  {item.room ? ` · ${item.room}` : ''}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 20,
    gap: 16,
  },
  title: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '700',
  },
  list: {
    gap: 10,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    gap: 12,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  rowMeta: {
    color: theme.textMuted,
    fontSize: 13,
  },
});
