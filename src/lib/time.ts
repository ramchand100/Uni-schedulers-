import type { TimeInterval } from '@/types/domain';

/** Parses "HH:MM" (or "HH:MM:SS") into minutes since midnight. */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':');
  return Number(h) * 60 + Number(m);
}

/** Formats minutes since midnight back into a zero-padded "HH:MM" string. */
export function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/** Formats "HH:MM" as a 12-hour clock string, e.g. "1:30 PM". */
export function formatTime12h(time: string): string {
  const minutes = toMinutes(time);
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

export function intervalsOverlap(a: TimeInterval, b: TimeInterval): boolean {
  return toMinutes(a.startTime) < toMinutes(b.endTime) && toMinutes(b.startTime) < toMinutes(a.endTime);
}

/** Sorts intervals by start time and merges any that touch or overlap. */
export function mergeIntervals(intervals: TimeInterval[]): TimeInterval[] {
  if (intervals.length === 0) return [];

  const sorted = [...intervals].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  const merged: TimeInterval[] = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    if (toMinutes(current.startTime) <= toMinutes(last.endTime)) {
      if (toMinutes(current.endTime) > toMinutes(last.endTime)) {
        last.endTime = current.endTime;
      }
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

/**
 * Returns the gaps inside `window` not covered by any interval in `busy`.
 * `busy` need not be sorted or merged; overlapping/unsorted input is handled internally.
 */
export function complementIntervals(window: TimeInterval, busy: TimeInterval[]): TimeInterval[] {
  const merged = mergeIntervals(busy).filter((b) => intervalsOverlap(b, window));
  const free: TimeInterval[] = [];

  let cursor = toMinutes(window.startTime);
  const windowEnd = toMinutes(window.endTime);

  for (const b of merged) {
    const busyStart = Math.max(toMinutes(b.startTime), cursor);
    const busyEnd = Math.min(toMinutes(b.endTime), windowEnd);
    if (busyStart > cursor) {
      free.push({ startTime: fromMinutes(cursor), endTime: fromMinutes(busyStart) });
    }
    cursor = Math.max(cursor, busyEnd);
  }

  if (cursor < windowEnd) {
    free.push({ startTime: fromMinutes(cursor), endTime: fromMinutes(windowEnd) });
  }

  return free;
}

/** Returns the overlapping portion of two sorted, non-overlapping interval lists. */
export function intersectIntervalLists(a: TimeInterval[], b: TimeInterval[]): TimeInterval[] {
  const result: TimeInterval[] = [];
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    const start = Math.max(toMinutes(a[i].startTime), toMinutes(b[j].startTime));
    const end = Math.min(toMinutes(a[i].endTime), toMinutes(b[j].endTime));

    if (start < end) {
      result.push({ startTime: fromMinutes(start), endTime: fromMinutes(end) });
    }

    if (toMinutes(a[i].endTime) < toMinutes(b[j].endTime)) {
      i++;
    } else {
      j++;
    }
  }

  return result;
}
