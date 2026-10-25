import type { MouseEvent } from 'react';
import {
  CommentAuthorContainer,
  CommentAvatar,
  CommentContentContainer,
  CommentItem,
  ReplyingToTag,
  ToggleRepliesButton,
} from '../styles';
import type { IComment } from '../types';
import { getAvatarUrl } from '../utils';
import CommentActionsBar from './CommentActionsBar';

interface CommentRowProps {
  comment: IComment;
  isNested: boolean;
  isExpanded: boolean;
  isHighlighted: boolean;
  isOwner: boolean;
  onToggleReplies: (commentId: IComment['id']) => void;
  onReply: (e: MouseEvent, comment: IComment) => void;
  onLike: (e: MouseEvent, commentId: IComment['id']) => void;
  onOpenLikes: (e: MouseEvent, commentId: IComment['id']) => void;
  onDelete: (e: MouseEvent, commentId: IComment['id']) => void;
  onUserClick: (e: MouseEvent, username: string) => void;
}

/** Um único comentário (sem as respostas aninhadas — quem cuida disso é o CommentTree). */
const CommentRow = ({
  comment,
  isNested,
  isExpanded,
  isHighlighted,
  isOwner,
  onToggleReplies,
  onReply,
  onLike,
  onOpenLikes,
  onDelete,
  onUserClick,
}: CommentRowProps) => {
  const repliesCount = comment.replies?.length ?? 0;

  return (
    <CommentItem
      id={`comment-${comment.id}`}
      className={isNested ? 'is-reply' : ''}
      $isHighlighted={isHighlighted}
    >
      <CommentAvatar
        $avatarUrl={getAvatarUrl(comment.author.profile?.avatar)}
        onClick={(e) => onUserClick(e, comment.author.username)}
      />
      <CommentContentContainer>
        <CommentAuthorContainer
          onClick={(e) => onUserClick(e, comment.author.username)}
        >
          <strong>
            {comment.author.first_name || comment.author.username}
          </strong>
          <span>@{comment.author.username}</span>
        </CommentAuthorContainer>

        {/* CORREÇÃO AQUI: Utiliza o parent_author_username vindo do backend */}
        {comment.parent && comment.parent_author_username && (
          <ReplyingToTag>
            Em resposta a <span>@{comment.parent_author_username}</span>
          </ReplyingToTag>
        )}

        <p>{comment.content}</p>

        <CommentActionsBar
          comment={comment}
          isOwner={isOwner}
          onReply={onReply}
          onLike={onLike}
          onOpenLikes={onOpenLikes}
          onDelete={onDelete}
        />

        {repliesCount > 0 && !isNested && (
          <ToggleRepliesButton
            type="button"
            onClick={() => onToggleReplies(comment.id)}
          >
            <span className="line" />
            {isExpanded
              ? 'Ocultar respostas'
              : `Ver ${repliesCount} ${
                  repliesCount === 1 ? 'resposta' : 'respostas'
                }`}
          </ToggleRepliesButton>
        )}
      </CommentContentContainer>
    </CommentItem>
  );
};

export default CommentRow;
