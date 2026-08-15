import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/hooks/useSession';
import { toProfile } from '@/lib/mappers';
import { supabase } from '@/lib/supabase';
import type { DayOfWeek, Profile } from '@/types/domain';

export function profileQueryKey(userId: string | undefined) {
  return ['profile', userId] as const;
}

export function useProfile() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: profileQueryKey(userId),
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId!).single();
      if (error) throw error;
      return toProfile(data);
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return async (
    updates: Partial<{
      username: string;
      fullName: string;
      university: string;
      activeDays: DayOfWeek[];
      onboardingCompleted: boolean;
      notificationsEnabled: boolean;
      reminderMinutesBefore: number;
    }>
  ) => {
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({
        ...(updates.username !== undefined ? { username: updates.username } : {}),
        ...(updates.fullName !== undefined ? { full_name: updates.fullName } : {}),
        ...(updates.university !== undefined ? { university: updates.university } : {}),
        ...(updates.activeDays !== undefined ? { active_days: updates.activeDays } : {}),
        ...(updates.onboardingCompleted !== undefined ? { onboarding_completed: updates.onboardingCompleted } : {}),
        ...(updates.notificationsEnabled !== undefined ? { notifications_enabled: updates.notificationsEnabled } : {}),
        ...(updates.reminderMinutesBefore !== undefined ? { reminder_minutes_before: updates.reminderMinutesBefore } : {}),
      })
      .eq('id', userId);

    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
  };
}
