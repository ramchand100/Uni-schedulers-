import { computeFreeTimeOverlap } from '@/lib/freeTime';
import type { ClassSession, DayOfWeek } from '@/types/domain';

function session(dayOfWeek: DayOfWeek, startTime: string, endTime: string, userId = 'user'): ClassSession {
  return {
    id: `${userId}-${dayOfWeek}-${startTime}`,
    courseId: 'course',
    userId,
    dayOfWeek,
    startTime,
    endTime,
    sessionType: 'lecture',
  };
}

describe('computeFreeTimeOverlap', () => {
  const window = { startTime: '08:00', endTime: '18:00' };

  it('finds the overlapping free block between two schedules on the same day', () => {
    // Monday: me busy 09:00-11:00, them busy 10:00-12:00 -> only 08:00-09:00 and 12:00-18:00 free together
    const mine = [session(1, '09:00', '11:00', 'me')];
    const theirs = [session(1, '10:00', '12:00', 'them')];

    const result = computeFreeTimeOverlap(mine, theirs, [1], window);

    expect(result).toEqual([
      { dayOfWeek: 1, startTime: '08:00', endTime: '09:00' },
      { dayOfWeek: 1, startTime: '12:00', endTime: '18:00' },
    ]);
  });

  it('returns the full window on days neither person has class', () => {
    const result = computeFreeTimeOverlap([], [], [1], window);
    expect(result).toEqual([{ dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }]);
  });

  it('returns nothing on a day where combined classes cover the whole window', () => {
    const mine = [session(2, '08:00', '13:00', 'me')];
    const theirs = [session(2, '13:00', '18:00', 'them')];
    const result = computeFreeTimeOverlap(mine, theirs, [2], window);
    expect(result).toEqual([]);
  });

  it('only considers days in activeDays', () => {
    // Saturday (6) has a clash but is not an active day, so it should be ignored entirely.
    const mine = [session(6, '08:00', '18:00', 'me')];
    const result = computeFreeTimeOverlap(mine, [], [1], window);
    expect(result).toEqual([{ dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }]);
  });

  it('handles multiple sessions per day for both people', () => {
    const mine = [session(3, '09:00', '10:00', 'me'), session(3, '14:00', '15:00', 'me')];
    const theirs = [session(3, '09:30', '09:45', 'them')];
    const result = computeFreeTimeOverlap(mine, theirs, [3], window);
    expect(result).toEqual([
      { dayOfWeek: 3, startTime: '08:00', endTime: '09:00' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '14:00' },
      { dayOfWeek: 3, startTime: '15:00', endTime: '18:00' },
    ]);
  });
});
