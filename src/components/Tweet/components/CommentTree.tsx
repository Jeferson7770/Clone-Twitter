import { Fragment } from 'react';
import type { MouseEvent } from 'react';
import { NestedRepliesContainer } from '../styles';
import type { IComment } from '../types';
import CommentRow from './CommentRow';

/** Props compartilhadas por todos os níveis da árvore de comentários. */
export interface CommentTreeSharedProps {
  expandedComments: Record<string | number, boolean>;
  highlightedCommentId: IComment['id'] | null;
  currentUsername?: string;
  onToggleReplies: (commentId: IComment['id']) => void;
  onReply: (e: MouseEvent, comment: IComment) => void;
  onLike: (e: MouseEvent, commentId: IComment['id']) => void;
  onOpenLikes: (e: MouseEvent, commentId: IComment['id']) => void;
  onDelete: (e: MouseEvent, commentId: IComment['id']) => void;
  onUserClick: (e: MouseEvent, username: string) => void;
}

interface CommentTreeProps extends CommentTreeSharedProps {
  comments: IComment[];
  isNested?: boolean;
}

/** Lista de comentários com respostas aninhadas (recursivo). */
const CommentTree = ({
  comments,
  isNested = false,
  ...shared
}: CommentTreeProps) => (
  <>
    {comments.map((comment, index) => {
      const replies = comment.replies ?? [];
      const hasReplies = replies.length > 0;
      const isExpanded = Boolean(shared.expandedComments[comment.id]);
      const isHighlighted =
        String(shared.highlightedCommentId) === String(comment.id);

      return (
        <Fragment key={`${comment.id}-${index}`}>
          <CommentRow
            comment={comment}
            isNested={isNested}
            isExpanded={isExpanded}
            isHighlighted={isHighlighted}
            isOwner={shared.currentUsername === comment.author.username}
            onToggleReplies={shared.onToggleReplies}
            onReply={shared.onReply}
            onLike={shared.onLike}
            onOpenLikes={shared.onOpenLikes}
            onDelete={shared.onDelete}
            onUserClick={shared.onUserClick}
          />

          {hasReplies && (isNested || isExpanded) && (
            <NestedRepliesContainer $isNested>
              <CommentTree comments={replies} isNested {...shared} />
            </NestedRepliesContainer>
          )}
        </Fragment>
      );
    })}
  </>
);

export default CommentTree;
