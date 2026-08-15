import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/lib/colors';
import { toMinutes } from '@/lib/time';
import type { DayOfWeek, FreeTimeBlock, ScheduleBlock, TimeInterval } from '@/types/domain';
import { DAY_SHORT_LABELS } from '@/types/domain';

const HOUR_HEIGHT = 60;
const GUTTER_WIDTH = 48;
const DAY_COLUMN_WIDTH = 104;
const HEADER_HEIGHT = 32;
const DEFAULT_WINDOW: TimeInterval = { startTime: '08:00', endTime: '18:00' };

interface ScheduleGridProps {
  blocks: ScheduleBlock[];
  activeDays: DayOfWeek[];
  freeTimeBlocks?: FreeTimeBlock[];
  dayWindow?: TimeInterval;
  onBlockPress?: (blockId: string) => void;
}

export function ScheduleGrid({ blocks, activeDays, freeTimeBlocks, dayWindow = DEFAULT_WINDOW, onBlockPress }: ScheduleGridProps) {
  const windowStart = toMinutes(dayWindow.startTime);
  const windowEnd = toMinutes(dayWindow.endTime);
  const gridHeight = ((windowEnd - windowStart) / 60) * HOUR_HEIGHT;

  const hours: number[] = [];
  for (let h = Math.ceil(windowStart / 60); h <= Math.floor(windowEnd / 60); h++) {
    hours.push(h);
  }

  const blocksByDay = new Map<DayOfWeek, ScheduleBlock[]>();
  for (const block of blocks) {
    const existing = blocksByDay.get(block.dayOfWeek) ?? [];
    existing.push(block);
    blocksByDay.set(block.dayOfWeek, existing);
  }

  const freeByDay = new Map<DayOfWeek, FreeTimeBlock[]>();
  for (const block of freeTimeBlocks ?? []) {
    const existing = freeByDay.get(block.dayOfWeek) ?? [];
    existing.push(block);
    freeByDay.set(block.dayOfWeek, existing);
  }

  return (
    <ScrollView style={styles.verticalScroll} contentContainerStyle={styles.verticalContent}>
      <View style={styles.row}>
        <View style={{ width: GUTTER_WIDTH }}>
          <View style={{ height: HEADER_HEIGHT }} />
          <View style={{ height: gridHeight }}>
            {hours.map((h) => (
              <Text
                key={h}
                style={[styles.hourLabel, { top: ((h * 60 - windowStart) / 60) * HOUR_HEIGHT - 7 }]}
              >
                {formatHourLabel(h)}
              </Text>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.row, { height: HEADER_HEIGHT }]}>
              {activeDays.map((day) => (
                <View key={day} style={[styles.dayHeaderCell, { width: DAY_COLUMN_WIDTH }]}>
                  <Text style={styles.dayHeaderText}>{DAY_SHORT_LABELS[day]}</Text>
                </View>
              ))}
            </View>

            <View style={styles.row}>
              {activeDays.map((day) => (
                <View key={day} style={[styles.dayColumn, { width: DAY_COLUMN_WIDTH, height: gridHeight }]}>
                  {hours.map((h) => (
                    <View
                      key={h}
                      style={[styles.gridLine, { top: ((h * 60 - windowStart) / 60) * HOUR_HEIGHT }]}
                    />
                  ))}

                  {(freeByDay.get(day) ?? []).map((free, idx) => (
                    <View
                      key={`free-${idx}`}
                      style={[
                        styles.freeBlock,
                        {
                          top: ((toMinutes(free.startTime) - windowStart) / 60) * HOUR_HEIGHT,
                          height: ((toMinutes(free.endTime) - toMinutes(free.startTime)) / 60) * HOUR_HEIGHT,
                        },
                      ]}
                    />
                  ))}

                  {(blocksByDay.get(day) ?? []).map((block) => {
                    const top = ((toMinutes(block.startTime) - windowStart) / 60) * HOUR_HEIGHT;
                    const height = ((toMinutes(block.endTime) - toMinutes(block.startTime)) / 60) * HOUR_HEIGHT;
                    return (
                      <Pressable
                        key={block.id}
                        disabled={!onBlockPress}
                        onPress={() => onBlockPress?.(block.id)}
                        style={[styles.block, { top, height, backgroundColor: block.color }]}
                      >
                        <Text style={styles.blockTitle} numberOfLines={2}>
                          {block.title}
                        </Text>
                        {block.subtitle ? (
                          <Text style={styles.blockSubtitle} numberOfLines={1}>
                            {block.subtitle}
                          </Text>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function formatHourLabel(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${period}`;
}

const styles = StyleSheet.create({
  verticalScroll: {
    flex: 1,
  },
  verticalContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
  },
  hourLabel: {
    position: 'absolute',
    right: 8,
    color: theme.textMuted,
    fontSize: 11,
  },
  dayHeaderCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeaderText: {
    color: theme.text,
    fontWeight: '600',
    fontSize: 13,
  },
  dayColumn: {
    borderLeftWidth: 1,
    borderLeftColor: theme.border,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.border,
  },
  freeBlock: {
    position: 'absolute',
    left: 2,
    right: 2,
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    borderWidth: 1,
    borderColor: theme.success,
    borderRadius: 6,
  },
  block: {
    position: 'absolute',
    left: 2,
    right: 2,
    borderRadius: 8,
    padding: 4,
    overflow: 'hidden',
  },
  blockTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  blockSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
  },
});
