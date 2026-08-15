import { toMinutes } from '@/lib/time';
import type { DayOfWeek } from '@/types/domain';

export interface WeeklyReminderTime {
  /** expo-notifications weekday convention: 1-7, 1 = Sunday. */
  expoWeekday: number;
  hour: number;
  minute: number;
}

const MINUTES_PER_DAY = 24 * 60;
const DAYS_PER_WEEK = 7;

/**
 * Computes the weekly notification trigger for a reminder that fires
 * `minutesBefore` a class session starts, handling the case where the
 * reminder falls on the previous day (e.g. a class starting at 00:05).
 */
export function computeWeeklyReminderTime(dayOfWeek: DayOfWeek, startTime: string, minutesBefore: number): WeeklyReminderTime {
  const startMinutes = toMinutes(startTime);
  const totalMinutes = ((dayOfWeek * MINUTES_PER_DAY + startMinutes - minutesBefore) % (MINUTES_PER_DAY * DAYS_PER_WEEK) + MINUTES_PER_DAY * DAYS_PER_WEEK) % (MINUTES_PER_DAY * DAYS_PER_WEEK);

  const reminderDay = Math.floor(totalMinutes / MINUTES_PER_DAY) as DayOfWeek;
  const minuteOfDay = totalMinutes % MINUTES_PER_DAY;

  return {
    expoWeekday: reminderDay + 1,
    hour: Math.floor(minuteOfDay / 60),
    minute: minuteOfDay % 60,
  };
}
