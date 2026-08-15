import { useQuery } from '@tanstack/react-query';

import { fetchCoursesWithSessions } from '@/lib/api/schedule';

export function coursesQueryKey(userId: string | undefined, semesterId: string | undefined) {
  return ['courses', userId, semesterId] as const;
}

export function useCoursesForUserAndSemester(userId: string | undefined, semesterId: string | undefined) {
  return useQuery({
    queryKey: coursesQueryKey(userId, semesterId),
    queryFn: () => fetchCoursesWithSessions(userId!, semesterId!),
    enabled: !!userId && !!semesterId,
  });
}
