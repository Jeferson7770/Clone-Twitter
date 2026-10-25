import { useCallback } from 'react';
import type { Dispatch, MouseEvent, SetStateAction } from 'react';
import { api } from '../../../services/api';
import type { ILikedUser } from '../types';

/** Seguir / deixar de seguir um usuário dentro de uma lista (curtidas, retweets...). */
export function useFollowToggle(
  setUsers: Dispatch<SetStateAction<ILikedUser[]>>
) {
  return useCallback(
    async (e: MouseEvent, targetUser: ILikedUser) => {
      e.stopPropagation();
      try {
        const response = await api.post(`users/${targetUser.username}/follow/`);
        if (response.status === 200 || response.status === 201) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === targetUser.id
                ? { ...u, is_following: !u.is_following }
                : u
            )
          );
        }
      } catch (error) {
        console.error('Erro ao seguir/deixar de seguir:', error);
      }
    },
    [setUsers]
  );
}
