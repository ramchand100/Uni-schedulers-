import { Stack } from 'expo-router';

import { theme } from '@/lib/colors';

export default function FriendsLayout() {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="add"
        options={{ presentation: 'modal', title: 'Add friend', headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text }}
      />
      <Stack.Screen
        name="[friendId]/index"
        options={{ title: '', headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text }}
      />
    </Stack>
  );
}
