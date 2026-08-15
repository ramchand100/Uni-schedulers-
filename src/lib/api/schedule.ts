import { toClassSession, toCourse } from '@/lib/mappers';
import { supabase } from '@/lib/supabase';
import type { CourseWithSessions } from '@/types/domain';

/**
 * Fetches a user's courses and class sessions for a semester and merges them
 * client-side. Two sequential flat queries (rather than a Postgrest embedded
 * join) keep the hand-written Database type simple: the same shape of query
 * works whether `userId` is the caller's own id or an accepted friend's,
 * since visibility is entirely enforced by RLS on each table.
 */
export async function fetchCoursesWithSessions(userId: string, semesterId: string): Promise<CourseWithSessions[]> {
  const coursesResult = await supabase.from('courses').select('*').eq('user_id', userId).eq('semester_id', semesterId);
  if (coursesResult.error) throw coursesResult.error;

  const courses = coursesResult.data.map(toCourse);
  if (courses.length === 0) return [];

  const sessionsResult = await supabase
    .from('class_sessions')
    .select('*')
    .eq('user_id', userId)
    .in('course_id', courses.map((c) => c.id));
  if (sessionsResult.error) throw sessionsResult.error;

  const sessionsByCourse = new Map<string, CourseWithSessions['sessions']>();
  for (const row of sessionsResult.data) {
    const session = toClassSession(row);
    const existing = sessionsByCourse.get(session.courseId) ?? [];
    existing.push(session);
    sessionsByCourse.set(session.courseId, existing);
  }

  return courses.map((course) => ({ ...course, sessions: sessionsByCourse.get(course.id) ?? [] }));
}
