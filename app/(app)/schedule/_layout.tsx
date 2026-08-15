import { Stack } from 'expo-router';

import { theme } from '@/lib/colors';

export default function ScheduleLayout() {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="course/new"
        options={{ presentation: 'modal', title: 'Add course', headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text }}
      />
      <Stack.Screen
        name="course/[courseId]/edit"
        options={{ presentation: 'modal', title: 'Edit course', headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text }}
      />
    </Stack>
  );
}
