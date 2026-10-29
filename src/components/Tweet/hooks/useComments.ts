import { useCallback, useEffect, useState, useRef } from 'react';
import type { MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../../services/api';
import type { IComment, ITweetData } from '../types';
import { removeCommentFromTree, toggleLikeInTree } from '../utils';

interface Options {
  tweet: ITweetData;
  onUpdate?: () => void;
}

interface ScrollTarget {
  id: string | number;
  nonce: number;
}

// Todos os IDs de comentários e respostas (recursivo)
function getAllCommentIds(comments: IComment[]): (string | number)[] {
  let ids: (string | number)[] = [];
  for (const comment of comments) {
    ids.push(comment.id);
    if (comment.replies && comment.replies.length > 0) {
      ids = ids.concat(getAllCommentIds(comment.replies));
    }
  }
  return ids;
}

// Comentário mais recente da árvore (fallback)
function getLatestCommentId(comments: IComment[]): string | number | null {
  if (!comments || comments.length === 0) return null;
  let latestId: string | number | null = null;
  let latestTime = -1;

  function traverse(list: IComment[]) {
    for (const comment of list) {
      const time = comment.created_at
        ? new Date(comment.created_at).getTime()
        : 0;
      if (time >= latestTime) {
        latestTime = time;
        latestId = comment.id;
      }
      if (comment.replies && comment.replies.length > 0) {
        traverse(comment.replies);
      }
    }
  }

  traverse(comments);
  return latestId;
}

// Comentário NOVO (que não existia antes) mais recente
function getNewestNewCommentId(
  comments: IComment[],
  previousIds: Set<string>
): string | number | null {
  let newestId: string | number | null = null;
  let newestTime = -1;

  function traverse(list: IComment[]) {
    for (const comment of list) {
      if (!previousIds.has(String(comment.id))) {
        const time = comment.created_at
          ? new Date(comment.created_at).getTime()
          : 0;
        if (time >= newestTime) {
          newestTime = time;
          newestId = comment.id;
        }
      }
      if (comment.replies && comment.replies.length > 0) {
        traverse(comment.replies);
      }
    }
  }

  traverse(comments);
  return newestId;
}

// Eventos que indicam que o usuário assumiu o controle do scroll
const USER_SCROLL_EVENTS = [
  'wheel',
  'touchmove',
  'keydown',
  'mousedown',
] as const;

export function useComments({ tweet, onUpdate }: Options) {
  const location = useLocation();
  const locationState = location.state as {
    highlightCommentId?: string | number;
    openComments?: boolean;
    notifKey?: number;
  } | null;

  const [comments, setComments] = useState<IComment[]>(tweet.comments || []);
  const [commentsCount, setCommentsCount] = useState(tweet.comments_count || 0);

  const [prevTweetComments, setPrevTweetComments] = useState(tweet.comments);
  const [prevTweetCommentsCount, setPrevTweetCommentsCount] = useState(
    tweet.comments_count
  );

  const [loadingList, setLoadingList] = useState(false);

  const notificationHighlightId = locationState?.highlightCommentId ?? null;
  const notificationKey = locationState?.notifKey ?? 0;
  const openFromNotification = Boolean(locationState?.openComments);

  // Alvo do scroll/destaque. O nonce faz um novo clique na mesma notificação
  // rolar de novo até o comentário.
  const [scrollTarget, setScrollTarget] = useState<ScrollTarget | null>(
    notificationHighlightId !== null
      ? { id: notificationHighlightId, nonce: notificationKey }
      : null
  );
  const [prevNotificationSig, setPrevNotificationSig] = useState(
    `${notificationHighlightId}-${notificationKey}`
  );
  const notificationSig = `${notificationHighlightId}-${notificationKey}`;
  if (notificationSig !== prevNotificationSig) {
    setPrevNotificationSig(notificationSig);
    if (notificationHighlightId !== null) {
      setScrollTarget({ id: notificationHighlightId, nonce: notificationKey });
    }
  }

  const highlightedCommentId = scrollTarget?.id ?? null;

  // Guarda qual alvo (id + nonce) já foi tratado (rolado ou cancelado pelo usuário)
  const handledScrollKeyRef = useRef<string | null>(null);

  // Sempre aponta para a lista mais recente
  const commentsRef = useRef<IComment[]>(comments);
  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  // Abre TODOS os comentários da árvore para garantir visibilidade
  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >(() => {
    const allIds = getAllCommentIds(tweet.comments || []);
    const initialMap: Record<string, boolean> = {};
    allIds.forEach((id) => {
      initialMap[String(id)] = true;
    });
    return initialMap;
  });

  const [manualOpen, setManualOpen] = useState(false);
  const [extraVisibleCount, setExtraVisibleCount] = useState(0);

  const fromNotification =
    notificationHighlightId !== null || openFromNotification;

  const isSectionOpen = fromNotification || manualOpen;
  const visibleCount = (fromNotification ? 200 : 3) + extraVisibleCount;

  // Busca comentários na inicialização e em tempo real (polling)
  const fetchComments = useCallback(
    async (isInitial = false): Promise<IComment[] | null> => {
      if (isInitial) setLoadingList(true);
      try {
        const response = await api.get(`tweets/${tweet.id}/`);
        if (response.data && response.data.comments) {
          const fetchedComments: IComment[] = response.data.comments;
          setComments(fetchedComments);
          if (response.data.comments_count !== undefined) {
            setCommentsCount(response.data.comments_count);
          }

          const allIds = getAllCommentIds(fetchedComments);
          setExpandedComments((prev) => {
            const next = { ...prev };
            allIds.forEach((id) => {
              next[String(id)] = true;
            });
            return next;
          });

          return fetchedComments;
        }
        return null;
      } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        return null;
      } finally {
        if (isInitial) setLoadingList(false);
      }
    },
    [tweet.id]
  );

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (
      fromNotification &&
      comments.length === 0 &&
      commentsCount > 0 &&
      !hasFetchedRef.current
    ) {
      hasFetchedRef.current = true;
      fetchComments(true);
    }
  }, [fromNotification, comments.length, commentsCount, fetchComments]);

  // Se o comentário alvo ainda não está na árvore (comentário novo que veio
  // pela notificação), busca imediatamente em vez de esperar o polling.
  const fetchedForTargetRef = useRef<string | null>(null);
  useEffect(() => {
    if (!scrollTarget) return;
    const key = `${scrollTarget.id}-${scrollTarget.nonce}`;
    if (fetchedForTargetRef.current === key) return;

    const exists = getAllCommentIds(commentsRef.current)
      .map(String)
      .includes(String(scrollTarget.id));

    fetchedForTargetRef.current = key;
    if (!exists) fetchComments(false);
  }, [scrollTarget, fetchComments]);

  // Polling a cada 4s se a seção estiver aberta
  useEffect(() => {
    if (!isSectionOpen) return;

    const intervalId = setInterval(() => {
      fetchComments(false);
    }, 4000);

    return () => clearInterval(intervalId);
  }, [isSectionOpen, fetchComments]);

  // Scroll até o comentário alvo: UMA vez por alvo (id + nonce); cancelado
  // se o usuário rolar/tocar/digitar antes de o comentário ser encontrado.
  useEffect(() => {
    if (!scrollTarget) return;

    const targetKey = String(scrollTarget.id);
    const handledKey = `${targetKey}-${scrollTarget.nonce}`;
    if (handledScrollKeyRef.current === handledKey) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const maxAttempts = 40;

    function stop() {
      cancelled = true;
      if (timer) clearTimeout(timer);
      USER_SCROLL_EVENTS.forEach((eventName) =>
        window.removeEventListener(eventName, onUserInterrupt, true)
      );
    }

    function onUserInterrupt() {
      handledScrollKeyRef.current = handledKey;
      stop();
    }

    USER_SCROLL_EVENTS.forEach((eventName) =>
      window.addEventListener(eventName, onUserInterrupt, {
        capture: true,
        passive: true,
      })
    );

    const tryScroll = () => {
      if (cancelled) return;

      const element = document.getElementById(`comment-${targetKey}`);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        handledScrollKeyRef.current = handledKey;
        stop();
        return;
      }

      // Ainda não renderizou: garante tudo expandido e tenta de novo
      const allIds = getAllCommentIds(commentsRef.current);
      if (allIds.length > 0) {
        setExpandedComments((prev) => {
          const next = { ...prev };
          allIds.forEach((id) => {
            next[String(id)] = true;
          });
          return next;
        });
      }

      if (attempts < maxAttempts) {
        attempts++;
        timer = setTimeout(tryScroll, 150);
      } else {
        handledScrollKeyRef.current = handledKey;
        stop();
      }
    };

    timer = setTimeout(tryScroll, 300);

    return stop;
  }, [scrollTarget]);

  // Sincroniza com as props quando o tweet pai é atualizado
  if (tweet.comments !== prevTweetComments) {
    setPrevTweetComments(tweet.comments);
    setComments(tweet.comments || []);
    const allIds = getAllCommentIds(tweet.comments || []);
    setExpandedComments((prev) => {
      const next = { ...prev };
      allIds.forEach((id) => {
        next[String(id)] = true;
      });
      return next;
    });
  }

  if (tweet.comments_count !== prevTweetCommentsCount) {
    setPrevTweetCommentsCount(tweet.comments_count);
    setCommentsCount(tweet.comments_count || 0);
  }

  const toggleReplies = (commentId: string | number) => {
    const key = String(commentId);
    setExpandedComments((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleSection = () => {
    const willOpen = !isSectionOpen;
    setManualOpen(willOpen);
    if (willOpen && comments.length === 0 && commentsCount > 0)
      fetchComments(true);
  };

  const closeSection = () => setManualOpen(false);

  const loadMore = () => setExtraVisibleCount((prev) => prev + 5);

  const deleteComment = async (e: MouseEvent, commentId: number | string) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      'Excluir este comentário?\n\nIsso não pode ser desfeito.'
    );
    if (!confirmed) return;

    try {
      await api.delete(`comments/${commentId}/`);
      setComments((prev) => removeCommentFromTree(prev, commentId));
      setCommentsCount((prev) => Math.max(0, prev - 1));
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
    }
  };

  const likeComment = async (e: MouseEvent, commentId: number | string) => {
    e.stopPropagation();
    setComments((prev) => toggleLikeInTree(prev, commentId));
    try {
      await api.post(`comments/${commentId}/like/`);
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
    }
  };

  const handleReplySubmitted = async (parentId?: IComment['id']) => {
    const previousIds = new Set(
      getAllCommentIds(commentsRef.current).map(String)
    );

    if (parentId) {
      setExpandedComments((prev) => ({ ...prev, [String(parentId)]: true }));
    }
    setCommentsCount((prev) => prev + 1);
    setManualOpen(true);

    const fetched = await fetchComments(false);

    if (fetched) {
      setExtraVisibleCount((prev) => Math.max(prev, fetched.length));

      const newId =
        getNewestNewCommentId(fetched, previousIds) ??
        getLatestCommentId(fetched);

      if (newId !== null) setScrollTarget({ id: newId, nonce: Date.now() });
    }

    if (onUpdate) onUpdate();
  };

  return {
    comments,
    commentsCount,
    loadingList,
    expandedComments,
    highlightedCommentId,
    isSectionOpen,
    visibleCount,
    toggleReplies,
    toggleSection,
    closeSection,
    loadMore,
    deleteComment,
    likeComment,
    handleReplySubmitted,
  };
}
