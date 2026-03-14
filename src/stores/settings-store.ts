import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, Language } from '../types/settings';

interface SettingsState {
  // Connection
  connectionStatus: 'untested' | 'ok' | 'error';
  connectionError?: string;
  // Provider accounts
  claudeEmail: string;
  claudeSessionKey: string;
  claudeStatus: 'unconfigured' | 'configured' | 'connected' | 'error';
  claudeError?: string;
  chatgptEmail: string;
  chatgptSessionToken: string;
  chatgptStatus: 'unconfigured' | 'configured' | 'connected' | 'error';
  chatgptError?: string;
  // UI
  theme: Theme;
  language: Language;
  sidebarCollapsed: boolean;
  // Actions
  setConnectionStatus: (status: 'untested' | 'ok' | 'error', error?: string) => void;
  setClaudeAccount: (email: string, sessionKey: string) => void;
  setClaudeStatus: (status: 'unconfigured' | 'configured' | 'connected' | 'error', error?: string) => void;
  setChatGPTAccount: (email: string, sessionToken: string) => void;
  setChatGPTStatus: (status: 'unconfigured' | 'configured' | 'connected' | 'error', error?: string) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      connectionStatus: 'untested',
      connectionError: undefined,
      claudeEmail: '',
      claudeSessionKey: '',
      claudeStatus: 'unconfigured',
      claudeError: undefined,
      chatgptEmail: '',
      chatgptSessionToken: '',
      chatgptStatus: 'unconfigured',
      chatgptError: undefined,
      theme: 'light',
      language: 'fr',
      sidebarCollapsed: false,
      setConnectionStatus: (status, error) => set({ connectionStatus: status, connectionError: error }),
      setClaudeAccount: (email, sessionKey) => set({ claudeEmail: email, claudeSessionKey: sessionKey, claudeStatus: sessionKey ? 'configured' : 'unconfigured' }),
      setClaudeStatus: (status, error) => set({ claudeStatus: status, claudeError: error }),
      setChatGPTAccount: (email, sessionToken) => set({ chatgptEmail: email, chatgptSessionToken: sessionToken, chatgptStatus: sessionToken ? 'configured' : 'unconfigured' }),
      setChatGPTStatus: (status, error) => set({ chatgptStatus: status, chatgptError: error }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (lang) => set({ language: lang }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: 'edugate-settings' }
  )
);
