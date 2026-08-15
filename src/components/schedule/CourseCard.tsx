import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/lib/colors';
import { formatTime12h } from '@/lib/time';
import type { Course } from '@/types/domain';

interface CourseCardProps {
  course: Course;
  sessionSummary?: string;
  onPress?: () => void;
}

export function CourseCard({ course, sessionSummary, onPress }: CourseCardProps) {
  const metaParts = [course.section, course.room, course.instructor].filter(Boolean);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={[styles.colorBar, { backgroundColor: course.color }]} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {course.courseCode ? `${course.courseCode} · ${course.title}` : course.title}
        </Text>
        {sessionSummary ? <Text style={styles.time}>{sessionSummary}</Text> : null}
        {metaParts.length > 0 ? (
          <Text style={styles.meta} numberOfLines={1}>
            {metaParts.join(' · ')}
          </Text>
        ) : null}
        <Text style={styles.credits}>{course.creditHours} credit hours</Text>
      </View>
    </Pressable>
  );
}

export function formatSessionSummary(dayLabel: string, startTime: string, endTime: string) {
  return `${dayLabel} · ${formatTime12h(startTime)} – ${formatTime12h(endTime)}`;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  colorBar: {
    width: 6,
  },
  body: {
    flex: 1,
    padding: 12,
    gap: 2,
  },
  title: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  time: {
    color: theme.text,
    fontSize: 13,
  },
  meta: {
    color: theme.textMuted,
    fontSize: 13,
  },
  credits: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
