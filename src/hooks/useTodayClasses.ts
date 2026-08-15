import { useMemo } from 'react';

import { useActiveSemester } from '@/hooks/useSemesters';
import { useCoursesForUserAndSemester } from '@/hooks/useCourses';
import { useSession } from '@/hooks/useSession';
import { toMinutes } from '@/lib/time';
import type { ClassSession, DayOfWeek } from '@/types/domain';

export interface TodayClassItem {
  session: ClassSession;
  courseTitle: string;
  courseCode: string | null;
  room: string | null;
  color: string;
}

export function useTodayClasses() {
  const { session } = useSession();
  const { data: activeSemester } = useActiveSemester();
  const coursesQuery = useCoursesForUserAndSemester(session?.user.id, activeSemester?.id);

  const todayItems = useMemo<TodayClassItem[]>(() => {
    if (!coursesQuery.data) return [];
    const today = new Date().getDay() as DayOfWeek;

    const items: TodayClassItem[] = [];
    for (const course of coursesQuery.data) {
      for (const classSession of course.sessions) {
        if (classSession.dayOfWeek === today) {
          items.push({
            session: classSession,
            courseTitle: course.title,
            courseCode: course.courseCode,
            room: course.room,
            color: course.color,
          });
        }
      }
    }

    return items.sort((a, b) => toMinutes(a.session.startTime) - toMinutes(b.session.startTime));
  }, [coursesQuery.data]);

  return { ...coursesQuery, data: todayItems };
}
