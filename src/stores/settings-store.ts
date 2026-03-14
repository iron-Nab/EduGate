import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, Language } from '../types/settings';

interface SettingsState {
  gatewayUrl: string;
  apiKey: string;
  connectionStatus: 'untested' | 'ok' | 'error';
  connectionError?: string;
  theme: Theme;
  language: Language;
  sidebarCollapsed: boolean;
  setGatewayUrl: (url: string) => void;
  setApiKey: (key: string) => void;
  setConnectionStatus: (status: 'untested' | 'ok' | 'error', error?: string) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      gatewayUrl: '',
      apiKey: '',
      connectionStatus: 'untested',
      connectionError: undefined,
      theme: 'light',
      language: 'fr',
      sidebarCollapsed: false,
      setGatewayUrl: (url) => set({ gatewayUrl: url, connectionStatus: 'untested' }),
      setApiKey: (key) => set({ apiKey: key, connectionStatus: 'untested' }),
      setConnectionStatus: (status, error) => set({ connectionStatus: status, connectionError: error }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (lang) => set({ language: lang }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: 'edugate-settings' }
  )
);
