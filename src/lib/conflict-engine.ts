import type { ScheduleEntry, Conflict } from '../types/scheduling';

export function detectConflicts(entries: ScheduleEntry[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];

      if (a.dayOfWeek !== b.dayOfWeek || a.timeSlotId !== b.timeSlotId) continue;
      if (a.semesterId !== b.semesterId) continue;

      if (a.roomId === b.roomId) {
        conflicts.push({
          type: 'ROOM',
          entryAId: a.id,
          entryBId: b.id,
          dayOfWeek: a.dayOfWeek,
          timeSlotId: a.timeSlotId,
          resourceId: a.roomId,
          message: `Room conflict: same room booked twice`,
        });
      }

      if (a.instructorId === b.instructorId) {
        conflicts.push({
          type: 'INSTRUCTOR',
          entryAId: a.id,
          entryBId: b.id,
          dayOfWeek: a.dayOfWeek,
          timeSlotId: a.timeSlotId,
          resourceId: a.instructorId,
          message: `Instructor conflict: same instructor assigned twice`,
        });
      }

      if (a.studentGroupId === b.studentGroupId) {
        conflicts.push({
          type: 'GROUP',
          entryAId: a.id,
          entryBId: b.id,
          dayOfWeek: a.dayOfWeek,
          timeSlotId: a.timeSlotId,
          resourceId: a.studentGroupId,
          message: `Group conflict: same student group has two sessions`,
        });
      }
    }
  }

  return conflicts;
}
