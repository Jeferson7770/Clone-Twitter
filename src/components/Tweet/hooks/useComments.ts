import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../../services/api';
import type { IComment, ITweetData } from '../types';
import {
  findParentsToExpand,
  removeCommentFromTree,
  toggleLikeInTree,
} from '../utils';

interface Options {
  tweet: ITweetData;
  onUpdate?: () => void;
}

/**
 * Dados e estado da seção de comentários: lista, contagem, expandir/recolher,
 * destaque vindo de notificação (com scroll), curtir e excluir comentário.
 */
export function useComments({ tweet, onUpdate }: Options) {
  const location = useLocation();
  const locationState = location.state as {
    highlightCommentId?: string | number;
  } | null;

  const [comments, setComments] = useState<IComment[]>(tweet.comments || []);
  const [commentsCount, setCommentsCount] = useState(tweet.comments_count || 0);

  const [prevTweetComments, setPrevTweetComments] = useState(tweet.comments);
  const [prevTweetCommentsCount, setPrevTweetCommentsCount] = useState(
    tweet.comments_count
  );

  const [loadingList, setLoadingList] = useState(false);
  const [expandedComments, setExpandedComments] = useState<
    Record<string | number, boolean>
  >({});

  // Derivação de estado para evitar chamadas de setState síncronas dentro de useEffects
  const hasNotificationHighlight = Boolean(locationState?.highlightCommentId);
  const [manualOpen, setManualOpen] = useState(false);
  const [extraVisibleCount, setExtraVisibleCount] = useState(0);

  const isSectionOpen = hasNotificationHighlight || manualOpen;
  const visibleCount = (hasNotificationHighlight ? 100 : 3) + extraVisibleCount;

  const [highlightedCommentId] = useState<number | string | null>(
    locationState?.highlightCommentId ?? null
  );

  const fetchComments = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await api.get(`tweets/${tweet.id}/`);
      if (response.data && response.data.comments) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    } finally {
      setLoadingList(false);
    }
  }, [tweet.id]);

  // Efeito unificado para carregar dados, expandir pais recursivamente e executar scroll
  useEffect(() => {
    const commentId = locationState?.highlightCommentId;
    if (!commentId) return;

    if (comments.length === 0 && commentsCount > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchComments();
      return;
    }

    const parentsToExpand = findParentsToExpand(comments, commentId);

    if (parentsToExpand && parentsToExpand.length > 0) {
      setExpandedComments((prev) => {
        const nextState = { ...prev };
        parentsToExpand.forEach((pId) => {
          nextState[pId] = true;
        });
        return nextState;
      });
    }

    let attempts = 0;
    const maxAttempts = 15;

    const tryScroll = () => {
      const element = document.getElementById(`comment-${commentId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryScroll, 100);
      }
    };

    const timer = setTimeout(tryScroll, 200);

    return () => clearTimeout(timer);
  }, [
    locationState?.highlightCommentId,
    comments,
    commentsCount,
    fetchComments,
  ]);

  // Sincroniza com as props quando o tweet pai é atualizado
  if (tweet.comments !== prevTweetComments) {
    setPrevTweetComments(tweet.comments);
    setComments(tweet.comments || []);
  }

  if (tweet.comments_count !== prevTweetCommentsCount) {
    setPrevTweetCommentsCount(tweet.comments_count);
    setCommentsCount(tweet.comments_count || 0);
  }

  const toggleReplies = (commentId: string | number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const toggleSection = () => {
    const willOpen = !isSectionOpen;
    setManualOpen(willOpen);
    if (willOpen && comments.length === 0 && commentsCount > 0) fetchComments();
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

  /** Chamado pelo useReplyComposer depois que uma resposta é enviada com sucesso. */
  const handleReplySubmitted = async (parentId?: IComment['id']) => {
    if (parentId) {
      setExpandedComments((prev) => ({ ...prev, [parentId]: true }));
    }
    setCommentsCount((prev) => prev + 1);
    setManualOpen(true);

    await fetchComments();
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
