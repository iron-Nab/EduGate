import { useCallback } from 'react';
import { gateway, GatewayError } from '../api/gateway-client';
import { useSettingsStore } from '../stores/settings-store';
import { useChatStore } from '../stores/chat-store';
import { db } from '../db';
import { generateId } from '../lib/utils';

export function useGateway() {
  const { gatewayUrl, apiKey } = useSettingsStore();
  const { setLoading, setError } = useChatStore();
  const isConfigured = Boolean(gatewayUrl && apiKey);

  const testConnection = useCallback(async () => {
    try {
      const result = await gateway.healthCheck();
      useSettingsStore.getState().setConnectionStatus('ok');
      return result;
    } catch (e) {
      const msg = e instanceof GatewayError ? e.message : 'Connection failed';
      useSettingsStore.getState().setConnectionStatus('error', msg);
      throw e;
    }
  }, []);

  const sendMessage = useCallback(async (content: string, sessionId?: string, systemPrompt?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Save user message locally
      const userMsg = {
        id: generateId(),
        sessionId: sessionId || 'pending',
        role: 'user' as const,
        content,
        createdAt: new Date(),
      };

      let response;
      if (sessionId) {
        response = await gateway.continueSession(sessionId, content);
      } else {
        response = await gateway.sendMessage(content, undefined, systemPrompt);
      }

      const actualSessionId = response.session_id;

      // Update user message with actual session id
      userMsg.sessionId = actualSessionId;
      await db.chatMessages.add(userMsg);

      // Save assistant message
      await db.chatMessages.add({
        id: generateId(),
        sessionId: actualSessionId,
        role: 'assistant',
        content: response.response,
        provider: response.provider,
        durationMs: response.duration_ms,
        createdAt: new Date(),
      });

      // Create or update session
      const existingSession = await db.chatSessions.get(actualSessionId);
      if (!existingSession) {
        await db.chatSessions.add({
          id: actualSessionId,
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          provider: response.provider,
          createdAt: new Date(),
          lastActiveAt: new Date(),
        });
      } else {
        await db.chatSessions.update(actualSessionId, { lastActiveAt: new Date() });
      }

      useChatStore.getState().setActiveSession(actualSessionId);
      return response;
    } catch (e) {
      const msg = e instanceof GatewayError ? e.message : 'Failed to send message';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  return { isConfigured, testConnection, sendMessage };
}
