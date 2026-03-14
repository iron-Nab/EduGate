import type { Room, Course, Instructor, StudentGroup, TimeSlot, ScheduleEntry } from '../types/scheduling';
import type { Conflict } from '../types/scheduling';
import { DAYS } from './utils';

interface SchedulingData {
  rooms: Room[];
  courses: Course[];
  instructors: Instructor[];
  studentGroups: StudentGroup[];
  timeSlots: TimeSlot[];
  entries?: ScheduleEntry[];
  conflicts?: Conflict[];
}

export function serializeForGeneration(data: SchedulingData): string {
  const lines: string[] = [];
  lines.push('You are a university timetable scheduler. Generate an optimal schedule based on the following resources and constraints.');
  lines.push('Return ONLY a JSON array of schedule entries with this format:');
  lines.push('```json');
  lines.push('[{"courseId": "...", "roomId": "...", "instructorId": "...", "studentGroupId": "...", "timeSlotId": "...", "dayOfWeek": 0}]');
  lines.push('```');
  lines.push('dayOfWeek: 0=Monday, 1=Tuesday, ..., 5=Saturday');
  lines.push('');
  lines.push('## Available Rooms');
  data.rooms.forEach(r => {
    lines.push(`- ${r.code} "${r.name}" type=${r.type} capacity=${r.capacity}`);
  });
  lines.push('');
  lines.push('## Courses to Schedule');
  data.courses.forEach(c => {
    lines.push(`- ${c.code} "${c.name}" type=${c.sessionType} hours/week=${c.hoursPerWeek} requiredRoom=${c.requiredRoomType || 'any'}`);
  });
  lines.push('');
  lines.push('## Instructors');
  data.instructors.forEach(i => {
    lines.push(`- ${i.id.slice(0,8)} "${i.firstName} ${i.lastName}" maxHours/day=${i.maxHoursPerDay} maxHours/week=${i.maxHoursPerWeek}`);
  });
  lines.push('');
  lines.push('## Student Groups');
  data.studentGroups.forEach(g => {
    lines.push(`- ${g.code} "${g.name}" size=${g.size}`);
  });
  lines.push('');
  lines.push('## Time Slots');
  data.timeSlots.filter(ts => !ts.isBreak).forEach(ts => {
    lines.push(`- ${ts.id.slice(0,8)} "${ts.name}" ${ts.startTime}-${ts.endTime}`);
  });
  lines.push('');
  lines.push('## Hard Constraints');
  lines.push('- No room double-booking (same room, same day, same time slot)');
  lines.push('- No instructor double-booking');
  lines.push('- No student group double-booking');
  lines.push('- Room capacity must be >= student group size');
  lines.push('- Room type must match course requirement if specified');
  lines.push('');
  lines.push('## Soft Constraints');
  lines.push('- Minimize gaps between sessions for student groups');
  lines.push('- Respect instructor max hours per day');
  lines.push('- Distribute sessions evenly across the week');

  return lines.join('\n');
}

export function serializeForOptimization(data: SchedulingData): string {
  const lines: string[] = [];
  lines.push('You are a university timetable optimizer. Analyze the current schedule and suggest improvements.');
  lines.push('Return suggestions as a JSON array:');
  lines.push('```json');
  lines.push('[{"action": "move", "entryId": "...", "newRoomId": "...", "newTimeSlotId": "...", "newDayOfWeek": 0, "reason": "..."}]');
  lines.push('```');
  lines.push('');

  if (data.entries && data.entries.length > 0) {
    lines.push('## Current Schedule');
    data.entries.forEach(e => {
      const day = DAYS.find(d => d.value === e.dayOfWeek)?.label || `Day${e.dayOfWeek}`;
      lines.push(`- Entry ${e.id.slice(0,8)}: course=${e.courseId.slice(0,8)} room=${e.roomId.slice(0,8)} instructor=${e.instructorId.slice(0,8)} group=${e.studentGroupId.slice(0,8)} timeSlot=${e.timeSlotId.slice(0,8)} day=${day}`);
    });
  }

  if (data.conflicts && data.conflicts.length > 0) {
    lines.push('');
    lines.push('## Detected Conflicts');
    data.conflicts.forEach(c => {
      lines.push(`- ${c.type}: ${c.message} (entries: ${c.entryAId.slice(0,8)}, ${c.entryBId.slice(0,8)})`);
    });
  }

  return lines.join('\n');
}

export function serializeForConflictExplanation(data: SchedulingData): string {
  const lines: string[] = [];
  lines.push('Explain the following scheduling conflicts in clear, simple language. Suggest how to resolve each one.');
  lines.push('');

  if (data.conflicts) {
    data.conflicts.forEach((c, i) => {
      lines.push(`### Conflict ${i + 1}: ${c.type}`);
      lines.push(c.message);
      lines.push('');
    });
  }

  return lines.join('\n');
}

interface RawEntry {
  courseId: string;
  roomId: string;
  instructorId: string;
  studentGroupId: string;
  timeSlotId: string;
  dayOfWeek: number;
}

export function parseScheduleResponse(response: string): RawEntry[] {
  const jsonMatch = response.match(/```json\s*([\s\S]*?)```/) || response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e: unknown): e is RawEntry =>
        typeof e === 'object' && e !== null &&
        'courseId' in e && 'roomId' in e && 'instructorId' in e &&
        'studentGroupId' in e && 'timeSlotId' in e && 'dayOfWeek' in e
    );
  } catch {
    return [];
  }
}
