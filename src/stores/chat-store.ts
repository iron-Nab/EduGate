import { create } from 'zustand';

interface ChatState {
  activeSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  setActiveSession: (id: string | null) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  activeSessionId: null,
  isLoading: false,
  error: null,
  setActiveSession: (id) => set({ activeSessionId: id }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (msg) => set({ error: msg }),
}));
