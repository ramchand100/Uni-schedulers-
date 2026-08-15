import { Stack } from 'expo-router';

import { theme } from '@/lib/colors';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="create-first-semester" />
    </Stack>
  );
}
