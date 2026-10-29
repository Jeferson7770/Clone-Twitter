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

// Helper para obter todos os IDs de comentários e respostas recursivamente (abre tudo)
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

// Helper para encontrar o ID do comentário mais recente (último a ser comentado)
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

export function useComments({ tweet, onUpdate }: Options) {
  const location = useLocation();
  const locationState = location.state as {
    highlightCommentId?: string | number;
    openComments?: boolean;
  } | null;

  const [comments, setComments] = useState<IComment[]>(tweet.comments || []);
  const [commentsCount, setCommentsCount] = useState(tweet.comments_count || 0);

  const [prevTweetComments, setPrevTweetComments] = useState(tweet.comments);
  const [prevTweetCommentsCount, setPrevTweetCommentsCount] = useState(
    tweet.comments_count
  );

  const [loadingList, setLoadingList] = useState(false);

  const notificationHighlightId = locationState?.highlightCommentId ?? null;
  const openFromNotification = Boolean(locationState?.openComments);

  // Alvo final: prioriza o ID da notificação, caso contrário usa o último comentário feito na árvore
  const targetCommentId =
    notificationHighlightId || getLatestCommentId(comments);
  const highlightedCommentId = targetCommentId;

  // Inicializa abrindo TODOS os comentários da árvore para garantir visibilidade total
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

  const isSectionOpen =
    Boolean(notificationHighlightId) || openFromNotification || manualOpen;
  const visibleCount =
    (Boolean(notificationHighlightId) || openFromNotification ? 200 : 3) +
    extraVisibleCount;

  // Função para buscar comentários na inicialização e em tempo real (polling)
  const fetchComments = useCallback(
    async (isInitial = false) => {
      if (isInitial) setLoadingList(true);
      try {
        const response = await api.get(`tweets/${tweet.id}/`);
        if (response.data && response.data.comments) {
          const fetchedComments = response.data.comments;
          setComments(fetchedComments);
          if (response.data.comments_count !== undefined) {
            setCommentsCount(response.data.comments_count);
          }

          // Abre todos os comentários e respostas recebidas em tempo real
          const allIds = getAllCommentIds(fetchedComments);
          setExpandedComments((prev) => {
            const next = { ...prev };
            allIds.forEach((id) => {
              next[String(id)] = true;
            });
            return next;
          });
        }
      } catch (error) {
        console.error('Erro ao buscar comentários:', error);
      } finally {
        if (isInitial) setLoadingList(false);
      }
    },
    [tweet.id]
  );

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (
      (openFromNotification || Boolean(notificationHighlightId)) &&
      comments.length === 0 &&
      commentsCount > 0 &&
      !hasFetchedRef.current
    ) {
      hasFetchedRef.current = true;
      fetchComments(true);
    }
  }, [
    openFromNotification,
    notificationHighlightId,
    comments.length,
    commentsCount,
    fetchComments,
  ]);

  // Atualização em tempo real (Polling a cada 4 segundos se a seção estiver aberta)
  useEffect(() => {
    if (!isSectionOpen) return;

    const intervalId = setInterval(() => {
      fetchComments(false);
    }, 4000);

    return () => clearInterval(intervalId);
  }, [isSectionOpen, fetchComments]);

  // Efeito robusto para garantir o scroll suave até ao comentário alvo (notificação ou último comentário)
  useEffect(() => {
    if (!targetCommentId) return;

    let attempts = 0;
    const maxAttempts = 30;

    const tryScroll = () => {
      const element = document.getElementById(`comment-${targetCommentId}`);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const allIds = getAllCommentIds(comments);
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
          setTimeout(tryScroll, 150);
        }
      }
    };

    const timer = setTimeout(tryScroll, 300);

    return () => clearTimeout(timer);
  }, [targetCommentId, comments]);

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
    if (parentId) {
      setExpandedComments((prev) => ({ ...prev, [String(parentId)]: true }));
    }
    setCommentsCount((prev) => prev + 1);
    setManualOpen(true);

    await fetchComments(true);
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
