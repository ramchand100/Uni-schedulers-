import { computeWeeklyReminderTime } from '@/lib/reminderTime';

describe('computeWeeklyReminderTime', () => {
  it('computes a same-day reminder before a normal class time', () => {
    // Monday (1) 09:00, 15 min before -> Monday 08:45
    expect(computeWeeklyReminderTime(1, '09:00', 15)).toEqual({ expoWeekday: 2, hour: 8, minute: 45 });
  });

  it('rolls back to the previous day when the reminder underflows midnight', () => {
    // Monday (1) 00:05, 15 min before -> Sunday 23:50
    expect(computeWeeklyReminderTime(1, '00:05', 15)).toEqual({ expoWeekday: 1, hour: 23, minute: 50 });
  });

  it('wraps around the week boundary from Sunday back to Saturday', () => {
    // Sunday (0) 00:05, 15 min before -> Saturday 23:50
    expect(computeWeeklyReminderTime(0, '00:05', 15)).toEqual({ expoWeekday: 7, hour: 23, minute: 50 });
  });

  it('returns the exact start time when minutesBefore is 0', () => {
    expect(computeWeeklyReminderTime(3, '14:30', 0)).toEqual({ expoWeekday: 4, hour: 14, minute: 30 });
  });
});
