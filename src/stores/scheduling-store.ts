import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewMode = 'all' | 'by-room' | 'by-instructor' | 'by-group';

interface SchedulingState {
  activeSemesterId: string | null;
  viewMode: ViewMode;
  selectedRoomId: string | null;
  selectedInstructorId: string | null;
  selectedGroupId: string | null;
  highlightedEntryIds: string[];
  aiGenerating: boolean;
  setActiveSemester: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedRoomId: (id: string | null) => void;
  setSelectedInstructorId: (id: string | null) => void;
  setSelectedGroupId: (id: string | null) => void;
  setAiGenerating: (v: boolean) => void;
  highlightConflict: (ids: string[]) => void;
  clearHighlight: () => void;
}

export const useSchedulingStore = create<SchedulingState>()(
  persist(
    (set) => ({
      activeSemesterId: null,
      viewMode: 'all',
      selectedRoomId: null,
      selectedInstructorId: null,
      selectedGroupId: null,
      highlightedEntryIds: [],
      aiGenerating: false,
      setActiveSemester: (id) => set({ activeSemesterId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSelectedRoomId: (id) => set({ selectedRoomId: id }),
      setSelectedInstructorId: (id) => set({ selectedInstructorId: id }),
      setSelectedGroupId: (id) => set({ selectedGroupId: id }),
      setAiGenerating: (v) => set({ aiGenerating: v }),
      highlightConflict: (ids) => set({ highlightedEntryIds: ids }),
      clearHighlight: () => set({ highlightedEntryIds: [] }),
    }),
    { name: 'edugate-scheduling' }
  )
);
