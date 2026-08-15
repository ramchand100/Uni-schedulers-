import { useMemo } from 'react';

import { computeFreeTimeOverlap, DEFAULT_DAY_WINDOW } from '@/lib/freeTime';
import type { ClassSession, DayOfWeek, TimeInterval } from '@/types/domain';

export function useFreeTimeOverlap(
  mySessions: ClassSession[],
  theirSessions: ClassSession[],
  activeDays: DayOfWeek[],
  dayWindow: TimeInterval = DEFAULT_DAY_WINDOW
) {
  return useMemo(
    () => computeFreeTimeOverlap(mySessions, theirSessions, activeDays, dayWindow),
    [mySessions, theirSessions, activeDays, dayWindow]
  );
}
