import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Spinner } from '@/components/ui/Spinner';
import { useCoursesForUserAndSemester } from '@/hooks/useCourses';
import { useFreeTimeOverlap } from '@/hooks/useFreeTimeOverlap';
import { useFriendActiveSemester, useFriendProfile } from '@/hooks/useFriendSchedule';
import { useProfile } from '@/hooks/useProfile';
import { useActiveSemester } from '@/hooks/useSemesters';
import { useSession } from '@/hooks/useSession';
import { theme } from '@/lib/colors';
import { courseWithSessionsToBlocks } from '@/lib/scheduleBlocks';
import type { ClassSession, DayOfWeek } from '@/types/domain';

export default function FriendScheduleScreen() {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const navigation = useNavigation();
  const { session } = useSession();

  const { data: myProfile } = useProfile();
  const { data: myActiveSemester } = useActiveSemester();
  const myCoursesQuery = useCoursesForUserAndSemester(session?.user.id, myActiveSemester?.id);

  const { data: friendProfile, isLoading: friendProfileLoading } = useFriendProfile(friendId);
  const { data: friendActiveSemester, isLoading: friendSemesterLoading } = useFriendActiveSemester(friendId);
  const friendCoursesQuery = useCoursesForUserAndSemester(friendId, friendActiveSemester?.id);

  useEffect(() => {
    if (friendProfile) {
      navigation.setOptions({ title: friendProfile.fullName || `@${friendProfile.username}` });
    }
  }, [friendProfile, navigation]);

  const activeDays = useMemo<DayOfWeek[]>(() => {
    const mine = new Set(myProfile?.activeDays ?? []);
    const theirs = new Set(friendProfile?.activeDays ?? []);
    return [...mine].filter((d) => theirs.has(d)).sort() as DayOfWeek[];
  }, [myProfile, friendProfile]);

  const mySessions = useMemo<ClassSession[]>(
    () => (myCoursesQuery.data ?? []).flatMap((c) => c.sessions),
    [myCoursesQuery.data]
  );
  const friendSessions = useMemo<ClassSession[]>(
    () => (friendCoursesQuery.data ?? []).flatMap((c) => c.sessions),
    [friendCoursesQuery.data]
  );

  const freeTimeBlocks = useFreeTimeOverlap(mySessions, friendSessions, activeDays);

  const isLoading = friendProfileLoading || friendSemesterLoading || myCoursesQuery.isLoading || friendCoursesQuery.isLoading;
  const isError = myCoursesQuery.isError || friendCoursesQuery.isError;

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <ErrorState
        onRetry={() => {
          myCoursesQuery.refetch();
          friendCoursesQuery.refetch();
        }}
      />
    );
  }

  if (!friendActiveSemester) {
    return (
      <View style={styles.container}>
        <EmptyState title="No schedule yet" description="This friend hasn't set up a semester." />
      </View>
    );
  }

  const myBlocks = courseWithSessionsToBlocks(myCoursesQuery.data ?? []);
  const friendBlocks = courseWithSessionsToBlocks(friendCoursesQuery.data ?? []).map((b) => ({
    ...b,
    subtitle: b.subtitle ? `${friendProfile?.username} · ${b.subtitle}` : `@${friendProfile?.username}`,
  }));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.legend}>
          <LegendDot color={theme.primary} label="Mine" />
          <LegendDot color="#0EA5E9" label="Theirs" />
          <LegendDot color={theme.success} label="Free together" />
        </View>

        <View style={styles.gridBox}>
          <ScheduleGrid blocks={[...myBlocks, ...friendBlocks]} activeDays={activeDays} freeTimeBlocks={freeTimeBlocks} />
        </View>

        {freeTimeBlocks.length === 0 ? (
          <EmptyState title="No free time overlap" description="Your active schedules don't leave any shared gaps right now." />
        ) : null}
      </ScrollView>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: theme.textMuted,
    fontSize: 12,
  },
  gridBox: {
    height: 460,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
});
