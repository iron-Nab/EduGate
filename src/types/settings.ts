export type Theme = 'light' | 'dark' | 'system';
export type Language = 'fr' | 'ar' | 'en';

export interface GatewayConfig {
  url: string;
  apiKey: string;
  connectionStatus: 'untested' | 'ok' | 'error';
  connectionError?: string;
}
