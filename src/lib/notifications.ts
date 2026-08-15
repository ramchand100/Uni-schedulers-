import * as Notifications from 'expo-notifications';

import { computeWeeklyReminderTime } from '@/lib/reminderTime';
import type { CourseWithSessions } from '@/types/domain';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

/**
 * Cancels every previously scheduled class reminder and schedules a fresh
 * weekly reminder for each class session. Cancel-then-reschedule is the
 * simplest correct way to keep reminders in sync with course edits, since
 * this app doesn't otherwise track which notification id belongs to which
 * session.
 */
export async function syncClassReminders(courses: CourseWithSessions[], minutesBefore: number): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const course of courses) {
    for (const session of course.sessions) {
      const { expoWeekday, hour, minute } = computeWeeklyReminderTime(session.dayOfWeek, session.startTime, minutesBefore);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: course.courseCode ? `${course.courseCode} · ${course.title}` : course.title,
          body: `Starts in ${minutesBefore} minutes${course.room ? ` · ${course.room}` : ''}`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: expoWeekday,
          hour,
          minute,
        },
      });
    }
  }
}
