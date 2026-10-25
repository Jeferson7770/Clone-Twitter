import type { MouseEvent } from 'react';
import {
  ActionWrapper,
  CommentIcon,
  CommentItemActions,
  LikeCountSpan,
  LikeIcon,
  TrashIconSpan,
} from '../styles';
import type { IComment } from '../types';

interface CommentActionsBarProps {
  comment: IComment;
  isOwner: boolean;
  onReply: (e: MouseEvent, comment: IComment) => void;
  onLike: (e: MouseEvent, commentId: IComment['id']) => void;
  onOpenLikes: (e: MouseEvent, commentId: IComment['id']) => void;
  onDelete: (e: MouseEvent, commentId: IComment['id']) => void;
}

/** Responder, curtir e excluir (só dono) de um comentário. */
const CommentActionsBar = ({
  comment,
  isOwner,
  onReply,
  onLike,
  onOpenLikes,
  onDelete,
}: CommentActionsBarProps) => {
  const hasReplies = (comment.replies_count || 0) > 0;

  return (
    <CommentItemActions>
      <ActionWrapper
        onClick={(e) => onReply(e, comment)}
        $isCommented={hasReplies}
        title="Responder"
      >
        <CommentIcon $hasReplies={hasReplies} />
        <span>{comment.replies_count || 0}</span>
      </ActionWrapper>

      <ActionWrapper
        onClick={(e) => onLike(e, comment.id)}
        $isLiked={comment.is_liked}
        title="Curtir"
      >
        <LikeIcon $isLiked={comment.is_liked} />
        <LikeCountSpan
          style={{ color: comment.is_liked ? '#f91880' : 'inherit' }}
          onClick={(e) => onOpenLikes(e, comment.id)}
        >
          {comment.likes_count || 0}
        </LikeCountSpan>
      </ActionWrapper>

      {isOwner && (
        <ActionWrapper
          onClick={(e) => onDelete(e, comment.id)}
          title="Deletar Comentário"
        >
          <TrashIconSpan>🗑️</TrashIconSpan>
        </ActionWrapper>
      )}
    </CommentItemActions>
  );
};

export default CommentActionsBar;
