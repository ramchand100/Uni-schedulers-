import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ColorPicker } from '@/components/forms/ColorPicker';
import { DayToggleRow } from '@/components/forms/DayToggleRow';
import { TimeField } from '@/components/forms/TimeField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { CourseFormInput, CourseSessionInput } from '@/hooks/useCourseMutations';
import { COURSE_COLORS, theme } from '@/lib/colors';
import { toMinutes } from '@/lib/time';
import type { DayOfWeek, SessionType } from '@/types/domain';

const SESSION_TYPES: SessionType[] = ['lecture', 'lab', 'tutorial'];

function newSessionRow(): CourseSessionInput {
  return { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', sessionType: 'lecture' };
}

interface CourseFormProps {
  semesterId: string;
  initialValues?: Partial<Omit<CourseFormInput, 'semesterId'>>;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (input: CourseFormInput) => void;
}

export function CourseForm({ semesterId, initialValues, submitLabel, isSubmitting, onSubmit }: CourseFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [courseCode, setCourseCode] = useState(initialValues?.courseCode ?? '');
  const [instructor, setInstructor] = useState(initialValues?.instructor ?? '');
  const [creditHours, setCreditHours] = useState(String(initialValues?.creditHours ?? 3));
  const [section, setSection] = useState(initialValues?.section ?? '');
  const [room, setRoom] = useState(initialValues?.room ?? '');
  const [color, setColor] = useState(initialValues?.color ?? COURSE_COLORS[0]);
  const [sessions, setSessions] = useState<CourseSessionInput[]>(
    initialValues?.sessions && initialValues.sessions.length > 0 ? initialValues.sessions : [newSessionRow()]
  );
  const [error, setError] = useState<string | null>(null);

  const updateSession = (index: number, patch: Partial<CourseSessionInput>) => {
    setSessions((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const removeSession = (index: number) => {
    setSessions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    setError(null);

    if (!title.trim()) {
      setError('Course title is required');
      return;
    }

    const parsedCredits = Number(creditHours);
    if (!Number.isFinite(parsedCredits) || parsedCredits <= 0) {
      setError('Credit hours must be a positive number');
      return;
    }

    if (sessions.length === 0) {
      setError('Add at least one class time');
      return;
    }

    for (const s of sessions) {
      if (toMinutes(s.endTime) <= toMinutes(s.startTime)) {
        setError('Each class time must end after it starts');
        return;
      }
    }

    onSubmit({
      semesterId,
      title: title.trim(),
      courseCode: courseCode.trim() || undefined,
      instructor: instructor.trim() || undefined,
      creditHours: parsedCredits,
      section: section.trim() || undefined,
      room: room.trim() || undefined,
      color,
      sessions,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Input label="Course title" placeholder="Data Structures" value={title} onChangeText={setTitle} />
      <Input label="Course code" placeholder="CS-201" value={courseCode} onChangeText={setCourseCode} />
      <Input label="Instructor" placeholder="Dr. Ahmed" value={instructor} onChangeText={setInstructor} />
      <View style={styles.rowFields}>
        <View style={{ flex: 1 }}>
          <Input label="Credit hours" keyboardType="decimal-pad" value={creditHours} onChangeText={setCreditHours} />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Section" placeholder="A" value={section} onChangeText={setSection} />
        </View>
      </View>
      <Input label="Room" placeholder="Block C, Room 204" value={room} onChangeText={setRoom} />

      <View style={styles.field}>
        <Text style={styles.label}>Color</Text>
        <ColorPicker value={color} onChange={setColor} />
      </View>

      <View style={styles.field}>
        <View style={styles.sessionsHeader}>
          <Text style={styles.label}>Class times</Text>
          <Pressable onPress={() => setSessions((prev) => [...prev, newSessionRow()])}>
            <Text style={styles.addSession}>+ Add time</Text>
          </Pressable>
        </View>

        {sessions.map((s, index) => (
          <View key={index} style={styles.sessionRow}>
            <DayToggleRow
              multiSelect={false}
              selected={[s.dayOfWeek]}
              onChange={(days) => updateSession(index, { dayOfWeek: days[0] as DayOfWeek })}
            />
            <View style={styles.rowFields}>
              <TimeField label="Starts" value={s.startTime} onChange={(v) => updateSession(index, { startTime: v })} />
              <TimeField label="Ends" value={s.endTime} onChange={(v) => updateSession(index, { endTime: v })} />
            </View>
            <View style={styles.rowFields}>
              {SESSION_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => updateSession(index, { sessionType: type })}
                  style={[styles.typePill, s.sessionType === type && styles.typePillSelected]}
                >
                  <Text style={[styles.typePillText, s.sessionType === type && styles.typePillTextSelected]}>{type}</Text>
                </Pressable>
              ))}
            </View>
            {sessions.length > 1 ? (
              <Pressable onPress={() => removeSession(index)}>
                <Text style={styles.removeSession}>Remove this time</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title={submitLabel} onPress={handleSubmit} loading={isSubmitting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 60,
  },
  field: {
    gap: 8,
  },
  label: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addSession: {
    color: theme.primary,
    fontWeight: '600',
  },
  sessionRow: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  typePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  typePillSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  typePillText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  typePillTextSelected: {
    color: theme.primaryText,
  },
  removeSession: {
    color: theme.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  error: {
    color: theme.danger,
    fontSize: 14,
  },
});
