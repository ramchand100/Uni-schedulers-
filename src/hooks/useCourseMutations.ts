import { useMutation, useQueryClient } from '@tanstack/react-query';

import { coursesQueryKey } from '@/hooks/useCourses';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';
import type { DayOfWeek, SessionType } from '@/types/domain';

export interface CourseSessionInput {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  sessionType: SessionType;
}

export interface CourseFormInput {
  semesterId: string;
  title: string;
  courseCode?: string;
  instructor?: string;
  creditHours: number;
  section?: string;
  room?: string;
  color: string;
  sessions: CourseSessionInput[];
}

async function insertSessions(userId: string, courseId: string, sessions: CourseSessionInput[]) {
  if (sessions.length === 0) return;
  const { error } = await supabase.from('class_sessions').insert(
    sessions.map((s) => ({
      course_id: courseId,
      user_id: userId,
      day_of_week: s.dayOfWeek,
      start_time: s.startTime,
      end_time: s.endTime,
      session_type: s.sessionType,
    }))
  );
  if (error) throw error;
}

export function useCreateCourse() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CourseFormInput) => {
      if (!userId) throw new Error('Not authenticated');

      const { data: course, error } = await supabase
        .from('courses')
        .insert({
          semester_id: input.semesterId,
          user_id: userId,
          title: input.title,
          course_code: input.courseCode || null,
          instructor: input.instructor || null,
          credit_hours: input.creditHours,
          section: input.section || null,
          room: input.room || null,
          color: input.color,
        })
        .select('*')
        .single();
      if (error) throw error;

      await insertSessions(userId, course.id, input.sessions);
      return course;
    },
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: coursesQueryKey(userId, course.semester_id) });
    },
  });
}

export function useUpdateCourse() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, input }: { courseId: string; input: CourseFormInput }) => {
      if (!userId) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('courses')
        .update({
          title: input.title,
          course_code: input.courseCode || null,
          instructor: input.instructor || null,
          credit_hours: input.creditHours,
          section: input.section || null,
          room: input.room || null,
          color: input.color,
        })
        .eq('id', courseId);
      if (updateError) throw updateError;

      // Simplest correct way to sync repeatable session rows: replace them all.
      const { error: deleteError } = await supabase.from('class_sessions').delete().eq('course_id', courseId);
      if (deleteError) throw deleteError;

      await insertSessions(userId, courseId, input.sessions);
      return input.semesterId;
    },
    onSuccess: (semesterId) => {
      queryClient.invalidateQueries({ queryKey: coursesQueryKey(userId, semesterId) });
    },
  });
}

export function useDeleteCourse() {
  const { session } = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId }: { courseId: string; semesterId: string }) => {
      const { error } = await supabase.from('courses').delete().eq('id', courseId);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coursesQueryKey(userId, variables.semesterId) });
    },
  });
}
