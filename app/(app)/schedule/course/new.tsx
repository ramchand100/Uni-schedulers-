import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { CourseForm } from '@/components/forms/CourseForm';
import { useCreateCourse } from '@/hooks/useCourseMutations';
import { useActiveSemester } from '@/hooks/useSemesters';
import { theme } from '@/lib/colors';

export default function NewCourseScreen() {
  const { data: activeSemester } = useActiveSemester();
  const createCourse = useCreateCourse();

  if (!activeSemester) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Create a semester first from the Semesters screen.</Text>
      </View>
    );
  }

  return (
    <CourseForm
      semesterId={activeSemester.id}
      submitLabel="Add course"
      isSubmitting={createCourse.isPending}
      onSubmit={(input) => {
        createCourse.mutate(input, { onSuccess: () => router.back() });
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 24,
    justifyContent: 'center',
  },
  message: {
    color: theme.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
});
