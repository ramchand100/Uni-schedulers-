import type { CourseWithSessions, ScheduleBlock } from '@/types/domain';

export function courseWithSessionsToBlocks(courses: CourseWithSessions[]): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = [];

  for (const course of courses) {
    const subtitleParts = [course.section, course.room].filter(Boolean);
    for (const session of course.sessions) {
      blocks.push({
        id: session.id,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        title: course.courseCode ? `${course.courseCode} · ${course.title}` : course.title,
        subtitle: subtitleParts.length > 0 ? subtitleParts.join(' · ') : null,
        color: course.color,
      });
    }
  }

  return blocks;
}
