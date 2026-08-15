import type { Database } from '@/types/database';
import type { ClassSession, Course, DayOfWeek, Profile, Semester } from '@/types/domain';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type SemesterRow = Database['public']['Tables']['semesters']['Row'];
type CourseRow = Database['public']['Tables']['courses']['Row'];
type ClassSessionRow = Database['public']['Tables']['class_sessions']['Row'];

export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    university: row.university,
    avatarColor: row.avatar_color,
    activeDays: row.active_days as DayOfWeek[],
  };
}

export function toSemester(row: SemesterRow): Semester {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    term: row.term,
    year: row.year,
    isActive: row.is_active,
  };
}

export function toCourse(row: CourseRow): Course {
  return {
    id: row.id,
    semesterId: row.semester_id,
    userId: row.user_id,
    title: row.title,
    courseCode: row.course_code,
    instructor: row.instructor,
    creditHours: row.credit_hours,
    section: row.section,
    room: row.room,
    color: row.color,
  };
}

export function toClassSession(row: ClassSessionRow): ClassSession {
  return {
    id: row.id,
    courseId: row.course_id,
    userId: row.user_id,
    dayOfWeek: row.day_of_week as DayOfWeek,
    // Postgres `time` columns come back as "HH:MM:SS"; trim to "HH:MM" for the app.
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    sessionType: row.session_type,
  };
}
