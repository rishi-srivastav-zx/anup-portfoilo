'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { executeAction } from '../actionExecutor/actionExecutor';

const CONV_STORAGE_KEY = 'ar_chat_conv_id';
const TOKEN_STORAGE_KEY = 'ar_chat_token';

/**
 * Normalizes the base Chat API URL from configuration.
 * Handles both root /api/chat and explicit /api/chat/message endpoints.
 */
const getBaseApiUrl = (rawUrl) => {
  if (!rawUrl) return 'http://localhost:5000/api/chat';
  return rawUrl.replace(/\/message\/?$/, '').replace(/\/$/, '');
};

/**
 * Initializes or retrieves an active conversation ID from the backend.
 */
const getOrCreateConversation = async (baseUrl) => {
  if (typeof window === 'undefined') return { conversationId: null, token: null };

  const storedId = sessionStorage.getItem(CONV_STORAGE_KEY);
  const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);

  if (storedId) {
    return { conversationId: storedId, token: storedToken };
  }

  try {
    const res = await fetch(`${baseUrl}/conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: { source: 'ChatAssistant_UI_Step9' } }),
    });

    const data = await res.json().catch(() => null);
    if (res.ok && data?.success && data?.data?.conversationId) {
      sessionStorage.setItem(CONV_STORAGE_KEY, data.data.conversationId);
      if (data.data.visitorToken || data.data.sessionToken) {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, data.data.visitorToken || data.data.sessionToken);
      }
      return {
        conversationId: data.data.conversationId,
        token: data.data.visitorToken || data.data.sessionToken || null,
      };
    }
  } catch (err) {
    console.warn('[useChatAssistant] Conversation init failed, using direct message dispatch:', err);
  }

  return { conversationId: null, token: null };
};

/**
 * Submits message to the Step 7/8/9 Chat API and extracts structured payload.
 */
const postChatMessage = async (baseUrl, messageText) => {
  const { conversationId, token } = await getOrCreateConversation(baseUrl);

  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['x-visitor-token'] = token;
  }

  const payload = {
    message: messageText,
  };
  if (conversationId) {
    payload.conversationId = conversationId;
  }

  const res = await fetch(`${baseUrl}/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = json.message || json.error?.message || json.error || 'Unable to connect to assistant';
    const error = new Error(errorMsg);
    error.status = res.status;
    error.code = json.code || json.error?.code;
    const retryHeader = res.headers.get('Retry-After');
    error.retryAfter = json.retryAfter || json.error?.retryAfter || (retryHeader ? parseInt(retryHeader, 10) : null);
    throw error;
  }

  const data = json.data || {};
  const msgObj = data.message || {};
  const replyText =
    msgObj.messageContent ||
    data.reply ||
    data.message ||
    'Here are the details from Anup Rawat’s portfolio.';

  return {
    reply: replyText,
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    actions: Array.isArray(data.actions) ? data.actions : [],
    fallbackStatus: data.fallbackStatus || null,
    conversationState: data.conversationState || null,
  };
};

const useChatAssistant = (config, options = {}) => {
  const { teaserDelay, apiUrl, errorReply } = config;
  const { routerPush } = options;

  const [open, setOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [typing, setTyping] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isContactModalOpen, setContactModalOpen] = useState(false);

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const autoExecTimerRef = useRef(null);

  const baseUrl = getBaseApiUrl(apiUrl);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  // Teaser display timer
  useEffect(() => {
    const t = setTimeout(() => setShowTeaser(true), teaserDelay);
    return () => clearTimeout(t);
  }, [teaserDelay]);

  // Restore conversation history from Neon PostgreSQL across page refresh / navigation
  useEffect(() => {
    let isCancelled = false;

    const restoreHistory = async () => {
      if (typeof window === 'undefined') return;

      const storedId = sessionStorage.getItem(CONV_STORAGE_KEY);
      const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedId) return;

      try {
        const headers = {};
        if (storedToken) {
          headers['x-visitor-token'] = storedToken;
        }

        const res = await fetch(`${baseUrl}/conversation/${storedId}`, { headers });
        const json = await res.json().catch(() => null);

        if (res.ok && json?.success && Array.isArray(json?.data?.messages) && !isCancelled) {
          const loaded = json.data.messages.map((m) => ({
            from: m.sender === 'user' ? 'user' : 'bot',
            text: m.content,
            actions: m.metadata?.actions || [],
            suggestions: m.metadata?.suggestions || [],
          }));

          if (loaded.length > 0) {
            setMessages(loaded);
            setShowChips(false);
          }
        } else if (res.status === 404 || res.status === 403) {
          sessionStorage.removeItem(CONV_STORAGE_KEY);
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } catch (err) {
        console.warn('[useChatAssistant] Restoration failed, continuing with fresh context:', err);
      }
    };

    restoreHistory();
    return () => {
      isCancelled = true;
    };
  }, [baseUrl]);

  // Scroll to latest message
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, typing, open]);

  // Focus & Escape handling
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Clean up auto execution timers on unmount
  useEffect(() => {
    return () => {
      if (autoExecTimerRef.current) clearTimeout(autoExecTimerRef.current);
    };
  }, []);

  const toggle = useCallback(() => {
    setOpen((o) => !o);
    setShowTeaser(false);
  }, []);

  const close = useCallback(() => setOpen(false), []);
  const hideTeaser = useCallback(() => setShowTeaser(false), []);

  /**
   * Resets active conversation and memory
   */
  const resetConversation = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CONV_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setMessages([]);
    setShowChips(true);
    setText('');
  }, []);

  const sendRef = useRef(null);

  /**
   * Safe execution handler for manual or automatic action dispatching
   */
  const handleExecuteAction = useCallback(
    async (action, isManualClick = false) => {
      return executeAction(action, {
        routerPush,
        onOpenContactModal: () => setContactModalOpen(true),
        onSendMessage: (txt) => {
          if (sendRef.current) sendRef.current(txt);
        },
        skipDuplicateCheck: isManualClick,
      });
    },
    [routerPush]
  );

  const send = useCallback(
    async (raw) => {
      const q = raw.trim();
      if (!q || typing || cooldownRemaining > 0) return;

      const next = [...messages, { from: 'user', text: q }];
      setShowChips(false);
      setMessages(next);
      setTyping(true);

      try {
        const { reply, suggestions, actions } = await postChatMessage(baseUrl, q);

        const botMsg = {
          from: 'bot',
          text: reply,
          suggestions,
          actions,
        };

        setMessages((m) => [...m, botMsg]);

        // Auto-execute explicitly requested navigation actions after a brief pause
        const autoAction = actions.find((a) => a.autoExecute === true);
        if (autoAction) {
          if (autoExecTimerRef.current) clearTimeout(autoExecTimerRef.current);
          autoExecTimerRef.current = setTimeout(() => {
            handleExecuteAction(autoAction, false);
          }, 600);
        }
      } catch (err) {
        if (err.status === 429 || err.retryAfter > 0) {
          const cd = err.retryAfter || 15;
          setCooldownRemaining(cd);
          // Preserve unsent message text on rate-limit error
          setText(q);
          setMessages((m) => [
            ...m,
            {
              from: 'bot',
              text: err.message || `You're messaging a bit too fast. Please wait ${cd}s before sending again.`,
              actions: [],
              isRateLimit: true,
            },
          ]);
        } else {
          // General connection error: preserve text
          setText(q);
          setMessages((m) => [
            ...m,
            { from: 'bot', text: err.message || errorReply, actions: [] },
          ]);
        }
      } finally {
        setTyping(false);
      }
    },
    [messages, typing, cooldownRemaining, baseUrl, errorReply, handleExecuteAction]
  );

  sendRef.current = send;

  const submit = useCallback(
    (e) => {
      e.preventDefault();
      if (typing || cooldownRemaining > 0 || !text.trim()) return;
      const current = text;
      setText('');
      send(current);
    },
    [send, text, typing, cooldownRemaining]
  );

  return {
    open,
    showTeaser: showTeaser && !open,
    showChips,
    typing,
    cooldownRemaining,
    text,
    setText,
    messages,
    listRef,
    inputRef,
    toggle,
    close,
    hideTeaser,
    send,
    submit,
    executeAction: (act) => handleExecuteAction(act, true),
    resetConversation,
    isContactModalOpen,
    setContactModalOpen,
  };
};

export default useChatAssistant;
