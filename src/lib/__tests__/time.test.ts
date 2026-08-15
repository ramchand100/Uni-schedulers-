import { complementIntervals, formatTime12h, fromMinutes, intersectIntervalLists, intervalsOverlap, mergeIntervals, toMinutes } from '@/lib/time';

describe('toMinutes / fromMinutes', () => {
  it('converts HH:MM to minutes and back', () => {
    expect(toMinutes('09:30')).toBe(570);
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('23:59')).toBe(1439);
    expect(fromMinutes(570)).toBe('09:30');
    expect(fromMinutes(0)).toBe('00:00');
  });
});

describe('formatTime12h', () => {
  it('formats midnight, noon, and afternoon correctly', () => {
    expect(formatTime12h('00:00')).toBe('12:00 AM');
    expect(formatTime12h('12:00')).toBe('12:00 PM');
    expect(formatTime12h('13:30')).toBe('1:30 PM');
    expect(formatTime12h('09:05')).toBe('9:05 AM');
  });
});

describe('intervalsOverlap', () => {
  it('detects overlap and touching-but-not-overlapping intervals', () => {
    expect(intervalsOverlap({ startTime: '09:00', endTime: '10:00' }, { startTime: '09:30', endTime: '11:00' })).toBe(true);
    expect(intervalsOverlap({ startTime: '09:00', endTime: '10:00' }, { startTime: '10:00', endTime: '11:00' })).toBe(false);
    expect(intervalsOverlap({ startTime: '09:00', endTime: '10:00' }, { startTime: '10:30', endTime: '11:00' })).toBe(false);
  });
});

describe('mergeIntervals', () => {
  it('merges overlapping and touching intervals, leaves separate ones alone', () => {
    const result = mergeIntervals([
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '09:30', endTime: '11:00' },
      { startTime: '13:00', endTime: '14:00' },
      { startTime: '11:00', endTime: '11:30' },
    ]);
    expect(result).toEqual([
      { startTime: '09:00', endTime: '11:30' },
      { startTime: '13:00', endTime: '14:00' },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(mergeIntervals([])).toEqual([]);
  });
});

describe('complementIntervals', () => {
  const window = { startTime: '08:00', endTime: '18:00' };

  it('returns the whole window when there is no busy time', () => {
    expect(complementIntervals(window, [])).toEqual([window]);
  });

  it('returns gaps around a single busy block', () => {
    const result = complementIntervals(window, [{ startTime: '10:00', endTime: '11:30' }]);
    expect(result).toEqual([
      { startTime: '08:00', endTime: '10:00' },
      { startTime: '11:30', endTime: '18:00' },
    ]);
  });

  it('handles back-to-back and unsorted busy blocks, clipped to the window', () => {
    const result = complementIntervals(window, [
      { startTime: '12:00', endTime: '13:00' },
      { startTime: '07:00', endTime: '09:00' },
      { startTime: '13:00', endTime: '14:00' },
    ]);
    expect(result).toEqual([
      { startTime: '09:00', endTime: '12:00' },
      { startTime: '14:00', endTime: '18:00' },
    ]);
  });

  it('returns nothing when busy time fully covers the window', () => {
    expect(complementIntervals(window, [{ startTime: '00:00', endTime: '23:59' }])).toEqual([]);
  });
});

describe('intersectIntervalLists', () => {
  it('returns overlapping portions of two sorted interval lists', () => {
    const a = [
      { startTime: '08:00', endTime: '10:00' },
      { startTime: '12:00', endTime: '15:00' },
    ];
    const b = [{ startTime: '09:00', endTime: '13:00' }];
    expect(intersectIntervalLists(a, b)).toEqual([
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '12:00', endTime: '13:00' },
    ]);
  });

  it('returns an empty array when there is no overlap', () => {
    const a = [{ startTime: '08:00', endTime: '09:00' }];
    const b = [{ startTime: '09:00', endTime: '10:00' }];
    expect(intersectIntervalLists(a, b)).toEqual([]);
  });
});
