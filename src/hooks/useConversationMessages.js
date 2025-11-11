import { useCallback, useEffect, useRef, useState } from 'react';
import { messageService } from '../services/supabase';
import { eventBus } from '../utils/eventBus';
import { useAuthStore } from '../stores/authStore';

const MESSAGE_PAGE_SIZE = 40;

export const useConversationMessages = (conversationId) => {
  const getUserId = useAuthStore((state) => state.getUserId);
  const userId = getUserId();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const cursorRef = useRef(null);
  const channelRef = useRef(null);
  const isFetchingRef = useRef(false);

  const updateMessagesState = useCallback((incomingMessages = []) => {
    if (!incomingMessages.length) return;

    setMessages((prev) => {
      const merged = new Map(prev.map((message) => [message.id, message]));

      incomingMessages.forEach((message) => {
        merged.set(message.id, message);
      });

      return Array.from(merged.values()).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, []);

  const loadMessages = useCallback(
    async ({ reset = false } = {}) => {
      if (!conversationId || isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (reset) {
        setLoading(true);
        cursorRef.current = null;
        setHasMore(true);
        setMessages([]);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const { data, error: fetchError } = await messageService.getMessages(conversationId, {
          limit: MESSAGE_PAGE_SIZE,
          cursor: reset ? null : cursorRef.current,
        });

        if (fetchError) {
          throw fetchError;
        }

        const fetchedMessages = Array.isArray(data) ? data : [];

        if (fetchedMessages.length === 0) {
          if (reset) {
            setMessages([]);
          }
          setHasMore(false);
          return;
        }

        const oldestTimestamp =
          fetchedMessages[fetchedMessages.length - 1]?.created_at || cursorRef.current;
        cursorRef.current = oldestTimestamp;

        updateMessagesState(fetchedMessages);
        setHasMore(fetchedMessages.length === MESSAGE_PAGE_SIZE);
      } catch (err) {
        console.error('Error cargando mensajes:', err);
        setError(err?.message || 'No se pudieron cargar los mensajes.');
      } finally {
        if (reset) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
        isFetchingRef.current = false;
      }
    },
    [conversationId, updateMessagesState]
  );

  const refreshMessages = useCallback(async () => {
    await loadMessages({ reset: true });
  }, [loadMessages]);

  const markAsRead = useCallback(async () => {
    if (!conversationId || !userId || markingRead) {
      return;
    }

    const hasUnread = messages.some(
      (message) => message.sender_id !== userId && !message.read_at
    );

    if (!hasUnread) {
      return;
    }

    setMarkingRead(true);

    try {
      const { error: markError } = await messageService.markConversationAsRead(
        conversationId,
        userId
      );
      if (markError) {
        throw markError;
      }
      setMessages((prev) =>
        prev.map((message) =>
          message.sender_id !== userId && !message.read_at
            ? { ...message, read_at: new Date().toISOString() }
            : message
        )
      );
      eventBus.emit('conversation:read', conversationId);
    } catch (err) {
      console.error('Error marcando mensajes como leídos:', err);
    } finally {
      setMarkingRead(false);
    }
  }, [conversationId, messages, userId, markingRead]);

  const markAsReadRef = useRef(markAsRead);
  useEffect(() => {
    markAsReadRef.current = markAsRead;
  }, [markAsRead]);

  const sendMessage = useCallback(
    async (content, { imageUrl = null } = {}) => {
      if (!conversationId || !userId) {
        return { success: false, error: new Error('No hay conversación activa.') };
      }

      const trimmedContent = (content || '').trim();
      if (!trimmedContent && !imageUrl) {
        return { success: false, error: new Error('El mensaje está vacío.') };
      }

      setSending(true);

      try {
        const { data, error: sendError } = await messageService.sendMessage(
          conversationId,
          userId,
          trimmedContent,
          imageUrl
        );

        if (sendError) {
          throw sendError;
        }

        if (data) {
          updateMessagesState([data]);
        }
        eventBus.emit('conversation:updated', { conversationId, lastMessage: data });
        return { success: true, data };
      } catch (err) {
        console.error('Error enviando mensaje:', err);
        setError(err?.message || 'No se pudo enviar el mensaje.');
        return { success: false, error: err };
      } finally {
        setSending(false);
      }
    },
    [conversationId, updateMessagesState, userId]
  );

  // Suscripción en tiempo real
  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    loadMessages({ reset: true });

    if (channelRef.current) {
      messageService.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    channelRef.current = messageService.subscribeToMessages(conversationId, {
      onInsert: (message) => {
        updateMessagesState([message]);
        if (message.sender_id !== userId) {
          markAsReadRef.current?.();
        }
      },
      onUpdate: (message) => {
        updateMessagesState([message]);
      },
    });

    return () => {
      if (channelRef.current) {
        messageService.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, loadMessages, updateMessagesState, userId]);

  // Marcar como leídos cuando llegan mensajes nuevos
  useEffect(() => {
    if (!conversationId) {
      return;
    }

    if (!loading) {
      markAsRead();
    }
  }, [conversationId, loading, messages, markAsRead]);

  return {
    messages,
    loading,
    sending,
    error,
    hasMore,
    loadingMore,
    refreshMessages,
    loadMore: () => loadMessages({ reset: false }),
    sendMessage,
  };
};


