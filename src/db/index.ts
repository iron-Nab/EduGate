import Dexie, { type Table } from 'dexie';
import type { Building, Room, Department, Program, Course, Instructor, StudentGroup, TimeSlot, Semester, ScheduleEntry } from '../types/scheduling';
import type { ChatSession, ChatMessage } from '../types/chat';

class EduGateDB extends Dexie {
  buildings!: Table<Building>;
  rooms!: Table<Room>;
  departments!: Table<Department>;
  programs!: Table<Program>;
  courses!: Table<Course>;
  instructors!: Table<Instructor>;
  studentGroups!: Table<StudentGroup>;
  timeSlots!: Table<TimeSlot>;
  semesters!: Table<Semester>;
  scheduleEntries!: Table<ScheduleEntry>;
  chatSessions!: Table<ChatSession>;
  chatMessages!: Table<ChatMessage>;

  constructor() {
    super('edugate');
    this.version(1).stores({
      buildings: 'id, code',
      rooms: 'id, buildingId, code, type',
      departments: 'id, code',
      programs: 'id, departmentId, code',
      courses: 'id, departmentId, programId, code',
      instructors: 'id, departmentId, email',
      studentGroups: 'id, programId, code, parentId',
      timeSlots: 'id, order',
      semesters: 'id, isCurrent',
      scheduleEntries: 'id, semesterId, courseId, roomId, instructorId, studentGroupId, timeSlotId, dayOfWeek',
      chatSessions: 'id, lastActiveAt',
      chatMessages: 'id, sessionId, createdAt',
    });
  }
}

export const db = new EduGateDB();

export type { Building, Room, Department, Program, Course, Instructor, StudentGroup, TimeSlot, Semester, ScheduleEntry };
export type { ChatSession, ChatMessage };
