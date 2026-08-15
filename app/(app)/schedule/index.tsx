import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CourseCard } from '@/components/schedule/CourseCard';
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Spinner } from '@/components/ui/Spinner';
import { useCoursesForUserAndSemester } from '@/hooks/useCourses';
import { useProfile } from '@/hooks/useProfile';
import { useActiveSemester } from '@/hooks/useSemesters';
import { useSession } from '@/hooks/useSession';
import { theme } from '@/lib/colors';
import { courseWithSessionsToBlocks } from '@/lib/scheduleBlocks';
import { ALL_DAYS } from '@/types/domain';

export default function ScheduleScreen() {
  const { session } = useSession();
  const { data: profile } = useProfile();
  const { data: activeSemester, isLoading: semesterLoading } = useActiveSemester();
  const coursesQuery = useCoursesForUserAndSemester(session?.user.id, activeSemester?.id);

  if (semesterLoading || coursesQuery.isLoading) {
    return <Spinner />;
  }

  if (coursesQuery.isError) {
    return <ErrorState onRetry={coursesQuery.refetch} />;
  }

  if (!activeSemester) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="No active semester yet"
          description="Create a semester to start building your schedule."
        />
        <Pressable style={styles.primaryButton} onPress={() => router.push('/(app)/semesters')}>
          <Text style={styles.primaryButtonText}>Go to Semesters</Text>
        </Pressable>
      </View>
    );
  }

  const courses = coursesQuery.data ?? [];
  const activeDays = profile?.activeDays ?? ALL_DAYS.filter((d) => d >= 1 && d <= 5);
  const blocks = courseWithSessionsToBlocks(courses);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{activeSemester.name}</Text>
          <Text style={styles.subtitle}>{courses.length} course{courses.length === 1 ? '' : 's'}</Text>
        </View>
        <Pressable style={styles.addButton} onPress={() => router.push('/(app)/schedule/course/new')}>
          <Text style={styles.addButtonText}>+ Add course</Text>
        </Pressable>
      </View>

      {courses.length === 0 ? (
        <EmptyState title="No courses yet" description="Tap Add course to build your timetable." />
      ) : (
        <>
          <View style={styles.gridBox}>
            <ScheduleGrid
              blocks={blocks}
              activeDays={activeDays}
              onBlockPress={(sessionId) => {
                const course = courses.find((c) => c.sessions.some((s) => s.id === sessionId));
                if (course) router.push(`/(app)/schedule/course/${course.id}/edit`);
              }}
            />
          </View>
          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={coursesQuery.isFetching} onRefresh={coursesQuery.refetch} tintColor={theme.primary} />
            }
          >
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} onPress={() => router.push(`/(app)/schedule/course/${course.id}/edit`)} />
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 13,
  },
  addButton: {
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: theme.primaryText,
    fontWeight: '600',
    fontSize: 13,
  },
  gridBox: {
    height: 380,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  primaryButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.primaryText,
    fontWeight: '600',
  },
  listScroll: {
    flex: 1,
  },
  list: {
    gap: 10,
    paddingBottom: 20,
  },
});
