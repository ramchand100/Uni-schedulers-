import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { CourseForm } from '@/components/forms/CourseForm';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useCoursesForUserAndSemester } from '@/hooks/useCourses';
import { useDeleteCourse, useUpdateCourse } from '@/hooks/useCourseMutations';
import { useActiveSemester } from '@/hooks/useSemesters';
import { useSession } from '@/hooks/useSession';
import { theme } from '@/lib/colors';

export default function EditCourseScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { session } = useSession();
  const { data: activeSemester } = useActiveSemester();
  const coursesQuery = useCoursesForUserAndSemester(session?.user.id, activeSemester?.id);
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  if (coursesQuery.isLoading || !activeSemester) {
    return <Spinner />;
  }

  const course = coursesQuery.data?.find((c) => c.id === courseId);

  if (!course) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>This course could not be found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CourseForm
        semesterId={activeSemester.id}
        initialValues={{
          title: course.title,
          courseCode: course.courseCode ?? undefined,
          instructor: course.instructor ?? undefined,
          creditHours: course.creditHours,
          section: course.section ?? undefined,
          room: course.room ?? undefined,
          color: course.color,
          sessions: course.sessions.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            sessionType: s.sessionType,
          })),
        }}
        submitLabel="Save changes"
        isSubmitting={updateCourse.isPending}
        onSubmit={(input) => {
          updateCourse.mutate({ courseId: course.id, input }, { onSuccess: () => router.back() });
        }}
      />
      <View style={styles.deleteContainer}>
        <Button
          title="Delete course"
          variant="danger"
          loading={deleteCourse.isPending}
          onPress={() => {
            deleteCourse.mutate({ courseId: course.id, semesterId: activeSemester.id }, { onSuccess: () => router.back() });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  message: {
    color: theme.textMuted,
    fontSize: 15,
    textAlign: 'center',
    padding: 24,
  },
  deleteContainer: {
    padding: 20,
    paddingTop: 0,
  },
});
