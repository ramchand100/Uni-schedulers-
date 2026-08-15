import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/hooks/useSession';
import { toSemester } from '@/lib/mappers';
import { supabase } from '@/lib/supabase';
import type { Semester, SemesterTerm } from '@/types/domain';

export function semestersQueryKey(userId: string | undefined) {
  return ['semesters', userId] as const;
}

export function useSemesters() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: semestersQueryKey(userId),
    queryFn: async (): Promise<Semester[]> => {
      const { data, error } = await supabase
        .from('semesters')
        .select('*')
        .eq('user_id', userId!)
        .order('year', { ascending: false })
        .order('term', { ascending: false });
      if (error) throw error;
      return data.map(toSemester);
    },
    enabled: !!userId,
  });
}

export function useActiveSemester() {
  const { data: semesters, ...rest } = useSemesters();
  return { data: semesters?.find((s) => s.isActive), ...rest };
}

interface CreateSemesterInput {
  name: string;
  term: SemesterTerm;
  year: number;
}

export function useCreateSemester() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSemesterInput) => {
      if (!userId) throw new Error('Not authenticated');

      // Only one semester should be "active" at a time, so demote the rest first.
      await supabase.from('semesters').update({ is_active: false }).eq('user_id', userId);

      const { data, error } = await supabase
        .from('semesters')
        .insert({ user_id: userId, name: input.name, term: input.term, year: input.year, is_active: true })
        .select('*')
        .single();
      if (error) throw error;
      return toSemester(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: semestersQueryKey(userId) });
    },
  });
}

export function useSetActiveSemester() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (semesterId: string) => {
      if (!userId) throw new Error('Not authenticated');
      await supabase.from('semesters').update({ is_active: false }).eq('user_id', userId);
      const { error } = await supabase.from('semesters').update({ is_active: true }).eq('id', semesterId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: semestersQueryKey(userId) });
    },
  });
}
