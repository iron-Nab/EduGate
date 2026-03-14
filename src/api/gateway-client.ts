import { useSettingsStore } from '../stores/settings-store';
import type { ChatResponse, HealthResponse, ProviderStatus } from '../types/chat';

class GatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'GatewayError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { gatewayUrl, apiKey } = useSettingsStore.getState();
  if (!gatewayUrl) throw new GatewayError(0, 'Gateway URL not configured');

  const url = `${gatewayUrl.replace(/\/$/, '')}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const controller = new AbortController();
  const timeout = path.startsWith('/api/chat') ? 180000 : 10000;
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new GatewayError(res.status, body.detail || body.message || res.statusText);
    }
    return res.json();
  } catch (e) {
    clearTimeout(timer);
    if (e instanceof GatewayError) throw e;
    if ((e as Error).name === 'AbortError') throw new GatewayError(504, 'Request timeout');
    throw new GatewayError(0, (e as Error).message);
  }
}

export const gateway = {
  healthCheck: () => request<HealthResponse>('/api/health'),

  getProviders: () => request<Record<string, ProviderStatus>>('/api/providers'),

  sendMessage: (message: string, sessionId?: string, systemPrompt?: string) =>
    request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        session_id: sessionId,
        system_prompt: systemPrompt,
      }),
    }),

  continueSession: (sessionId: string, message: string) =>
    request<ChatResponse>(`/api/chat/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

export { GatewayError };
