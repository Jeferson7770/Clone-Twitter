import { useState } from 'react';
import type { MouseEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import type { ITweetData } from '../types';

interface Options {
  tweetId: ITweetData['id'];
  isOwner: boolean;
  onDelete?: (tweetId: number | string) => void;
}

export function useTweetDelete({ tweetId, isOwner, onDelete }: Options) {
  const { user, updateUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (e: MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSuccessfulDelete = () => {
    if (isOwner && user) {
      const currentTweets =
        (user as { tweets_count?: number }).tweets_count ?? 0;
      updateUser({
        ...user,
        tweets_count: Math.max(0, currentTweets - 1),
      } as typeof user & { tweets_count: number });
    }
    if (onDelete) onDelete(tweetId);
  };

  const confirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await api.delete(`tweets/${tweetId}/`);
      handleSuccessfulDelete();
    } catch (error: unknown) {
      const err = error as { response?: { status: number } };
      if (err.response && err.response.status === 404) {
        handleSuccessfulDelete();
      } else {
        console.error('Erro ao deletar tweet:', error);
      }
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  return { isDeleting, isModalOpen, openModal, closeModal, confirmDelete };
}
