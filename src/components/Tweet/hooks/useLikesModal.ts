import { useState } from 'react';
import type { MouseEvent } from 'react';
import { api } from '../../../services/api';
import type { ILikedUser, ITweetData } from '../types';
import { useFollowToggle } from './useFollowToggle';

/** Modal "Curtido por" — serve tanto para curtidas do tweet quanto de um comentário. */
export function useLikesModal(tweet: Pick<ITweetData, 'id' | 'liked_by'>) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('Curtido por');
  const [users, setUsers] = useState<ILikedUser[]>(tweet.liked_by || []);
  const [loading, setLoading] = useState(false);

  const toggleFollow = useFollowToggle(setUsers);

  const open = async (
    e: MouseEvent,
    modalTitle: string,
    endpoint: string,
    errorMessage: string
  ) => {
    e.stopPropagation();
    setTitle(modalTitle);
    setIsOpen(true);
    setLoading(true);
    try {
      const response = await api.get(endpoint);
      if (response.data && response.data.liked_by)
        setUsers(response.data.liked_by);
    } catch (error) {
      console.error(errorMessage, error);
    } finally {
      setLoading(false);
    }
  };

  const openForTweet = (e: MouseEvent) =>
    open(
      e,
      'Curtido por',
      `tweets/${tweet.id}/`,
      'Erro ao buscar lista de quem curtiu o tweet:'
    );

  const openForComment = (e: MouseEvent, commentId: number | string) =>
    open(
      e,
      'Curtidas do comentário',
      `comments/${commentId}/`,
      'Erro ao buscar lista de quem curtiu o comentário:'
    );

  const close = () => setIsOpen(false);

  return {
    isOpen,
    title,
    users,
    loading,
    openForTweet,
    openForComment,
    close,
    toggleFollow,
  };
}
