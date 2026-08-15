import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useCoursesForUserAndSemester } from '@/hooks/useCourses';
import { useProfile } from '@/hooks/useProfile';
import { useActiveSemester } from '@/hooks/useSemesters';
import { useSession } from '@/hooks/useSession';
import { ensureNotificationPermission, syncClassReminders } from '@/lib/notifications';

/**
 * Keeps local class-reminder notifications in sync with the user's active
 * semester. Mount once near the root of the authenticated app; re-syncs
 * whenever the course list, reminder settings, or active semester change.
 */
export function useScheduleNotifications() {
  const { session } = useSession();
  const { data: profile } = useProfile();
  const { data: activeSemester } = useActiveSemester();
  const { data: courses } = useCoursesForUserAndSemester(session?.user.id, activeSemester?.id);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (!profile || !courses) return;

    if (!profile.notificationsEnabled) {
      syncClassReminders([], 0);
      return;
    }

    ensureNotificationPermission().then((granted) => {
      if (!granted) return;
      syncClassReminders(courses, profile.reminderMinutesBefore);
    });
  }, [profile, courses]);
}
