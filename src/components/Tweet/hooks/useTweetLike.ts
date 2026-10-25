import { useState } from 'react';
import type { MouseEvent } from 'react';
import { api } from '../../../services/api';
import type { ITweetData } from '../types';

export function useTweetLike(
  tweet: Pick<ITweetData, 'id' | 'likes_count' | 'is_liked'>,
  onUpdate?: () => void
) {
  const [likesCount, setLikesCount] = useState(tweet.likes_count || 0);
  const [isLiked, setIsLiked] = useState(tweet.is_liked || false);

  const toggleLike = async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await api.post(`tweets/${tweet.id}/like/`);
      if (response.status === 200 || response.status === 201) {
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
        setIsLiked(!isLiked);
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao curtir tweet:', error);
    }
  };

  return { likesCount, isLiked, toggleLike };
}
