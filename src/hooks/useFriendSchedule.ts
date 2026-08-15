import { useQuery } from '@tanstack/react-query';

import { toProfile, toSemester } from '@/lib/mappers';
import { supabase } from '@/lib/supabase';

export function useFriendProfile(friendId: string) {
  return useQuery({
    queryKey: ['friendProfile', friendId],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', friendId).single();
      if (error) throw error;
      return toProfile(data);
    },
    enabled: !!friendId,
  });
}

export function useFriendActiveSemester(friendId: string) {
  return useQuery({
    queryKey: ['friendActiveSemester', friendId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('semesters')
        .select('*')
        .eq('user_id', friendId)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data ? toSemester(data) : null;
    },
    enabled: !!friendId,
  });
}
