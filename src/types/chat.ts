export interface ChatSession {
  id: string;
  title: string;
  provider?: string;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
  durationMs?: number;
  createdAt: Date;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  model?: string;
  provider?: string;
  duration_ms?: number;
}

export interface ProviderStatus {
  available: boolean;
  calls: number;
  avg_response_time?: number;
}

export interface HealthResponse {
  status: string;
  uptime?: number;
  version?: string;
}
