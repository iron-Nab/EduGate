export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatTime(time: string): string {
  return time;
}

export const DAYS = [
  { value: 0, label: 'Lundi', labelShort: 'Lun' },
  { value: 1, label: 'Mardi', labelShort: 'Mar' },
  { value: 2, label: 'Mercredi', labelShort: 'Mer' },
  { value: 3, label: 'Jeudi', labelShort: 'Jeu' },
  { value: 4, label: 'Vendredi', labelShort: 'Ven' },
  { value: 5, label: 'Samedi', labelShort: 'Sam' },
];

export const ROOM_TYPES = [
  { value: 'AMPHITHEATER', label: 'Amphitheatre' },
  { value: 'CLASSROOM', label: 'Salle de cours' },
  { value: 'LAB', label: 'Laboratoire' },
  { value: 'COMPUTER_LAB', label: 'Salle informatique' },
  { value: 'SEMINAR_ROOM', label: 'Salle de seminaire' },
  { value: 'OTHER', label: 'Autre' },
];

export const SESSION_TYPES = [
  { value: 'CM', label: 'Cours Magistral' },
  { value: 'TD', label: 'Travaux Diriges' },
  { value: 'TP', label: 'Travaux Pratiques' },
];

export const LEVELS = [
  { value: 'LICENCE', label: 'Licence' },
  { value: 'MASTER', label: 'Master' },
  { value: 'DOCTORAT', label: 'Doctorat' },
];

export const COURSE_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#f59e0b', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
];
