export type Theme = 'light' | 'dark' | 'system';
export type Language = 'fr' | 'ar' | 'en';
export type ProviderName = 'claude' | 'chatgpt';

export interface ProviderAccount {
  enabled: boolean;
  status: 'unconfigured' | 'configured' | 'connected' | 'error';
  error?: string;
}

export interface ClaudeAccount extends ProviderAccount {
  email: string;
  sessionKey: string;
}

export interface ChatGPTAccount extends ProviderAccount {
  email: string;
  sessionToken: string;
}
