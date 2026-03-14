export interface Building {
  id: string;
  code: string;
  name: string;
  address?: string;
  floors: number;
  createdAt: Date;
  updatedAt: Date;
}

export type RoomType = 'AMPHITHEATER' | 'CLASSROOM' | 'LAB' | 'COMPUTER_LAB' | 'SEMINAR_ROOM' | 'OTHER';

export interface Room {
  id: string;
  buildingId: string;
  code: string;
  name: string;
  type: RoomType;
  capacity: number;
  floor: number;
  equipment: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  nameFr?: string;
  nameAr?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Program {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  nameFr?: string;
  nameAr?: string;
  level: 'LICENCE' | 'MASTER' | 'DOCTORAT';
  durationYears: number;
  createdAt: Date;
  updatedAt: Date;
}

export type SessionType = 'CM' | 'TD' | 'TP';

export interface Course {
  id: string;
  departmentId: string;
  programId?: string;
  code: string;
  name: string;
  nameFr?: string;
  nameAr?: string;
  credits: number;
  yearLevel: number;
  sessionType: SessionType;
  hoursPerWeek: number;
  sessionDuration: number;
  requiredRoomType?: RoomType;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Instructor {
  id: string;
  departmentId?: string;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  maxHoursPerWeek: number;
  maxHoursPerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentGroup {
  id: string;
  programId: string;
  code: string;
  name: string;
  yearLevel: number;
  size: number;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  order: number;
  isBreak: boolean;
  createdAt: Date;
}

export interface Semester {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleEntry {
  id: string;
  semesterId: string;
  courseId: string;
  roomId: string;
  instructorId: string;
  studentGroupId: string;
  timeSlotId: string;
  dayOfWeek: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ConflictType = 'ROOM' | 'INSTRUCTOR' | 'GROUP';

export interface Conflict {
  type: ConflictType;
  entryAId: string;
  entryBId: string;
  dayOfWeek: number;
  timeSlotId: string;
  resourceId: string;
  message: string;
}
