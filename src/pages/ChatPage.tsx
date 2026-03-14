import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { Send, Plus, Trash2, Bot, User, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { db } from '../db';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useChatStore } from '../stores/chat-store';
import { useGateway } from '../hooks/use-gateway';
import { cn } from '../lib/utils';
import { NavLink } from 'react-router-dom';

export function ChatPage() {
  const { t } = useTranslation();
  const { activeSessionId, setActiveSession, isLoading, error } = useChatStore();
  const { isConfigured, sendMessage } = useGateway();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sessions = useLiveQuery(() => db.chatSessions.orderBy('lastActiveAt').reverse().toArray()) ?? [];
  const messages = useLiveQuery(
    () => activeSessionId ? db.chatMessages.where('sessionId').equals(activeSessionId).sortBy('createdAt') : ([] as import('../types/chat').ChatMessage[]),
    [activeSessionId]
  ) ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    try {
      await sendMessage(text, activeSessionId ?? undefined);
    } catch {
      // error is set in the store
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewSession = () => {
    setActiveSession(null);
  };

  const handleDeleteSession = async (id: string) => {
    await db.chatMessages.where('sessionId').equals(id).delete();
    await db.chatSessions.delete(id);
    if (activeSessionId === id) setActiveSession(null);
  };

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Settings className="w-12 h-12 text-text-muted mb-4" />
        <p className="text-text-secondary mb-4">{t('chat.noGateway')}</p>
        <NavLink to="/settings">
          <Button size="sm">{t('nav.settings')}</Button>
        </NavLink>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sessions sidebar */}
      <div className="w-64 border-r border-border bg-surface-alt flex flex-col shrink-0">
        <div className="p-3 border-b border-border">
          <Button onClick={handleNewSession} size="sm" className="w-full">
            <Plus className="w-4 h-4" />
            {t('chat.newSession')}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveSession(s.id)}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-surface-hover border-b border-border text-sm',
                activeSessionId === s.id && 'bg-primary-50 dark:bg-primary-900/20'
              )}
            >
              <div className="truncate flex-1">
                <p className="truncate font-medium">{s.title}</p>
                {s.provider && <Badge variant={s.provider === 'claude' ? 'info' : 'success'} className="mt-1">{s.provider}</Badge>}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id); }}
                className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-danger" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <EmptyState message={t('chat.title')} description={t('chat.placeholder')} />
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
              )}
              <div className={cn(
                'max-w-[70%] rounded-2xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : 'bg-surface-alt border border-border rounded-tl-sm'
              )}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                {msg.provider && msg.role === 'assistant' && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={msg.provider === 'claude' ? 'info' : 'success'}>{msg.provider}</Badge>
                    {msg.durationMs && <span className="text-xs text-text-muted">{(msg.durationMs / 1000).toFixed(1)}s</span>}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="bg-surface-alt border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:0.15s]" />
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}
          {error && <p className="text-center text-sm text-danger">{error}</p>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-32"
              style={{ minHeight: 44 }}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
