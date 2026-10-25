import type { useAuth } from '../../contexts/AuthContext';
import type { IComment, ILikedUser } from './types';

type AuthUser = NonNullable<ReturnType<typeof useAuth>['user']>;

export const getAvatarUrl = (avatarPath?: string | null) => {
  if (!avatarPath) return undefined;

  let baseURL = 'http://localhost:8000';
  const meta = import.meta as unknown as { env: Record<string, string> };
  if (typeof import.meta !== 'undefined' && meta.env) {
    baseURL = meta.env.VITE_API_URL || baseURL;
  }

  return avatarPath.startsWith('http') ? avatarPath : `${baseURL}${avatarPath}`;
};

export const formatTweetDate = (createdAt: string) =>
  new Date(createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

/** Retorna os ids dos pais que precisam estar expandidos para mostrar `targetId`. */
export const findParentsToExpand = (
  list: IComment[],
  targetId: string | number,
  parents: (string | number)[] = []
): (string | number)[] | null => {
  for (const item of list) {
    if (String(item.id) === String(targetId)) {
      return parents;
    }
    if (item.replies && item.replies.length > 0) {
      const result = findParentsToExpand(item.replies, targetId, [
        ...parents,
        item.id,
      ]);
      if (result) return result;
    }
  }
  return null;
};

export const removeCommentFromTree = (
  commentsList: IComment[],
  commentId: number | string
): IComment[] =>
  commentsList
    .filter((c) => c.id !== commentId)
    .map((c) => ({
      ...c,
      replies: c.replies ? removeCommentFromTree(c.replies, commentId) : [],
    }));

export const toggleLikeInTree = (
  commentsList: IComment[],
  targetId: number | string
): IComment[] =>
  commentsList.map((comment) => {
    if (comment.id === targetId) {
      const wasLiked = comment.is_liked;
      return {
        ...comment,
        is_liked: !wasLiked,
        likes_count: (comment.likes_count || 0) + (wasLiked ? -1 : 1),
      };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: toggleLikeInTree(comment.replies, targetId),
      };
    }
    return comment;
  });

/** Converte o usuário logado no formato usado nas listas de usuários. */
export const toLikedUser = (user: AuthUser): ILikedUser => ({
  id: user.id || '',
  username: user.username,
  first_name: user.first_name,
  profile: user.profile,
  is_following: false,
});

export const prependUserIfMissing = (
  list: ILikedUser[],
  user: AuthUser
): ILikedUser[] =>
  list.some((u) => u.username === user.username)
    ? list
    : [toLikedUser(user), ...list];
