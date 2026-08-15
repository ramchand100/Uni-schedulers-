// 0 = Sunday ... 6 = Saturday, matching Postgres EXTRACT(DOW).
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

export type SessionType = 'lecture' | 'lab' | 'tutorial';

export type SemesterTerm = 'Fall' | 'Spring' | 'Summer';

export interface Semester {
  id: string;
  userId: string;
  name: string;
  term: SemesterTerm;
  year: number;
  isActive: boolean;
}

export interface Course {
  id: string;
  semesterId: string;
  userId: string;
  title: string;
  courseCode: string | null;
  instructor: string | null;
  creditHours: number;
  section: string | null;
  room: string | null;
  color: string;
}

// start/end are "HH:MM" 24-hour strings, matching a Postgres `time` column.
export interface ClassSession {
  id: string;
  courseId: string;
  userId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  sessionType: SessionType;
}

export interface CourseWithSessions extends Course {
  sessions: ClassSession[];
}

export interface Profile {
  id: string;
  username: string;
  fullName: string | null;
  university: string | null;
  avatarColor: string;
  activeDays: DayOfWeek[];
  onboardingCompleted: boolean;
  notificationsEnabled: boolean;
  reminderMinutesBefore: number;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
}

export interface TimeInterval {
  startTime: string;
  endTime: string;
}

export interface FreeTimeBlock extends TimeInterval {
  dayOfWeek: DayOfWeek;
}

// A single renderable block on the ScheduleGrid, decoupled from the raw
// Course/ClassSession shape so the grid can render "own", "friend", and
// free-time-overlay blocks through one component.
export interface ScheduleBlock {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  title: string;
  subtitle: string | null;
  color: string;
}
