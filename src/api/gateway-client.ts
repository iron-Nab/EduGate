import type { ChatResponse, HealthResponse, ProviderStatus } from '../types/chat';

class GatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'GatewayError';
  }
}

// No auth needed — front and back are on the same server (backoffice)
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${window.location.origin}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

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

  sendMessage: (message: string, sessionId?: string, systemPrompt?: string, provider?: string) =>
    request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        session_id: sessionId,
        system_prompt: systemPrompt,
        provider,
      }),
    }),

  continueSession: (sessionId: string, message: string) =>
    request<ChatResponse>(`/api/chat/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // Claude auth
  getAuthStatus: () => request<{ authenticated: boolean; email?: string }>('/api/auth/status'),

  loginClaude: () =>
    request<{ message: string }>('/api/auth/login', { method: 'POST' }),

  refreshClaude: () =>
    request<{ message: string }>('/api/auth/refresh', { method: 'POST' }),

  // ChatGPT auth
  loginChatGPT: () =>
    request<{ message: string }>('/api/chatgpt/login', { method: 'POST' }),

  refreshChatGPT: () =>
    request<{ message: string }>('/api/chatgpt/refresh', { method: 'POST' }),

  // Admin — check provider status
  adminStatus: () =>
    request<{ claude: { available: boolean }; chatgpt: { available: boolean } }>('/api/admin/status'),
};

export { GatewayError };
