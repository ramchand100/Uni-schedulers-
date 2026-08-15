import { complementIntervals, intersectIntervalLists } from '@/lib/time';
import type { ClassSession, DayOfWeek, FreeTimeBlock, TimeInterval } from '@/types/domain';

export const DEFAULT_DAY_WINDOW: TimeInterval = { startTime: '08:00', endTime: '18:00' };

function sessionsByDay(sessions: ClassSession[]): Map<DayOfWeek, TimeInterval[]> {
  const map = new Map<DayOfWeek, TimeInterval[]>();
  for (const session of sessions) {
    const existing = map.get(session.dayOfWeek) ?? [];
    existing.push({ startTime: session.startTime, endTime: session.endTime });
    map.set(session.dayOfWeek, existing);
  }
  return map;
}

/**
 * Computes, per active day, the time blocks where neither person has a class.
 * Pure function so it can be unit-tested without React/Supabase.
 */
export function computeFreeTimeOverlap(
  mySessions: ClassSession[],
  theirSessions: ClassSession[],
  activeDays: DayOfWeek[],
  dayWindow: TimeInterval = DEFAULT_DAY_WINDOW
): FreeTimeBlock[] {
  const myBusyByDay = sessionsByDay(mySessions);
  const theirBusyByDay = sessionsByDay(theirSessions);
  const blocks: FreeTimeBlock[] = [];

  for (const day of activeDays) {
    const myFree = complementIntervals(dayWindow, myBusyByDay.get(day) ?? []);
    const theirFree = complementIntervals(dayWindow, theirBusyByDay.get(day) ?? []);
    const overlap = intersectIntervalLists(myFree, theirFree);

    for (const block of overlap) {
      blocks.push({ dayOfWeek: day, ...block });
    }
  }

  return blocks;
}
