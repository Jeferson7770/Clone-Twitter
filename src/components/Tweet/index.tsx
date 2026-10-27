import { useRef } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import { Avatar, Body, Container, Content, Description, Icons } from './styles';
import type { ITweetData } from './types';
import { formatTweetDate, getAvatarUrl } from './utils';

import { useClickOutside } from './hooks/useClickOutside';
import { useComments } from './hooks/useComments';
import { useLikesModal } from './hooks/useLikesModal';
import { useReplyComposer } from './hooks/useReplyComposer';
import { useRetweet } from './hooks/useRetweet';
import { useTweetDelete } from './hooks/useTweetDelete';
import { useTweetLike } from './hooks/useTweetLike';
import { useTweetMenus } from './hooks/useTweetMenus';

import CommentAction from './components/CommentAction';
import CommentsSection from './components/CommentsSection';
import type { CommentTreeSharedProps } from './components/CommentTree';
import DeleteTweetModal from './components/DeleteTweetModal';
import LikeAction from './components/LikeAction';
import QuotedTweet from './components/QuotedTweet';
import QuoteTweetModal from './components/QuoteTweetModal';
import ReplyModal from './components/ReplyModal';
import RetweetAction from './components/RetweetAction';
import RetweetedBanner from './components/RetweetedBanner';
import TweetHeader from './components/TweetHeader';
import TweetMedia from './components/TweetMedia';
import UsersModal from './components/UsersModal';

// Mantém os imports antigos funcionando
export type { IComment, ILikedUser, ITweetData } from './types';

interface TweetProps {
  tweet: ITweetData;
  onDelete?: (tweetId: number | string) => void;
  onUpdate?: () => void;
}

const Tweet = ({ tweet, onDelete, onUpdate }: TweetProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOwner = user?.username === tweet.author.username;
  const formattedDate = formatTweetDate(tweet.created_at);

  const commentSectionRef = useRef<HTMLDivElement>(null);

  // --- lógica (cada hook cuida de uma parte) ---
  const menus = useTweetMenus();
  const tweetDelete = useTweetDelete({ tweetId: tweet.id, isOwner, onDelete });
  const like = useTweetLike(tweet, onUpdate);
  const likesModal = useLikesModal(tweet);
  const retweet = useRetweet({ tweet, onUpdate, closeMenu: menus.closeMenu });
  const comments = useComments({ tweet, onUpdate });
  const reply = useReplyComposer({
    tweetId: tweet.id,
    onSubmitted: comments.handleReplySubmitted,
  });

  // Clicar fora da seção de comentários fecha a seção
  useClickOutside(
    [commentSectionRef, menus.commentMenuRef],
    comments.closeSection,
    comments.isSectionOpen
  );

  // --- handlers que misturam mais de um hook ---
  const handleUserClick = (e: MouseEvent, username: string) => {
    e.stopPropagation();
    navigate(`/profile/${username}`);
  };

  const handleCommentMenuToggle = (e: MouseEvent) => {
    e.stopPropagation();
    menus.toggleMenu('comment');
  };

  const handleRetweetMenuToggle = (e: MouseEvent) => {
    e.stopPropagation();
    menus.toggleMenu('retweet');
  };

  const handleReplyToTweet = (e: MouseEvent) => {
    menus.closeMenu();
    reply.openForTweet(e);
  };

  const handleViewAllComments = (e: MouseEvent) => {
    e.stopPropagation();
    menus.closeMenu();
    comments.toggleSection();
  };

  const commentTreeProps: CommentTreeSharedProps = {
    expandedComments: comments.expandedComments,
    highlightedCommentId: comments.highlightedCommentId,
    currentUsername: user?.username,
    onToggleReplies: comments.toggleReplies,
    onReply: reply.openForComment,
    onLike: comments.likeComment,
    onOpenLikes: likesModal.openForComment,
    onDelete: comments.deleteComment,
    onUserClick: handleUserClick,
  };

  return (
    <Container>
      {tweet.isRetweet && <RetweetedBanner />}

      <Body>
        <Avatar
          $avatarUrl={getAvatarUrl(tweet.author.profile?.avatar)}
          onClick={(e) => handleUserClick(e, tweet.author.username)}
        />

        <Content>
          <TweetHeader
            author={tweet.author}
            formattedDate={formattedDate}
            isOwner={isOwner}
            isDeleting={tweetDelete.isDeleting}
            onUserClick={handleUserClick}
            onDeleteClick={tweetDelete.openModal}
          />

          {tweet.content && <Description>{tweet.content}</Description>}

          {tweet.media && (
            <TweetMedia
              media={tweet.media}
              mediaType={tweet.media_type}
              expandable
            />
          )}

          {tweet.quoted_tweet && (
            <QuotedTweet
              tweet={tweet.quoted_tweet}
              onOpen={(id) => navigate(`/status/${id}`)}
              onUserClick={handleUserClick}
            />
          )}

          <Icons>
            <CommentAction
              menuRef={menus.commentMenuRef}
              count={comments.commentsCount}
              isMenuOpen={menus.openMenu === 'comment'}
              onToggleMenu={handleCommentMenuToggle}
              onReply={handleReplyToTweet}
              onViewAll={handleViewAllComments}
            />

            <RetweetAction
              menuRef={menus.retweetMenuRef}
              count={retweet.retweetsCount}
              isRetweeted={retweet.isRetweeted}
              hasQuoted={retweet.hasQuoted} // <-- Usando diretamente do hook useRetweet
              isMenuOpen={menus.openMenu === 'retweet'}
              onToggleMenu={handleRetweetMenuToggle}
              onRetweet={retweet.handleStandardRetweet}
              onQuote={retweet.quote.open}
              onOpenRetweetedBy={retweet.retweetedBy.open}
            />

            <LikeAction
              count={like.likesCount}
              isLiked={like.isLiked}
              onLike={like.toggleLike}
              onOpenLikes={likesModal.openForTweet}
            />
          </Icons>
        </Content>
      </Body>

      {comments.isSectionOpen && (
        <CommentsSection
          containerRef={commentSectionRef}
          comments={comments.comments}
          loading={comments.loadingList}
          visibleCount={comments.visibleCount}
          onLoadMore={comments.loadMore}
          treeProps={commentTreeProps}
        />
      )}

      {reply.isOpen && (
        <ReplyModal
          tweet={tweet}
          replyingTo={reply.replyingTo}
          formattedDate={formattedDate}
          text={reply.text}
          loading={reply.loading}
          onTextChange={reply.setText}
          onSubmit={reply.submit}
          onClose={reply.close}
        />
      )}

      {tweetDelete.isModalOpen && (
        <DeleteTweetModal
          isDeleting={tweetDelete.isDeleting}
          onCancel={tweetDelete.closeModal}
          onConfirm={tweetDelete.confirmDelete}
        />
      )}

      {retweet.quote.isOpen && (
        <QuoteTweetModal
          tweet={tweet}
          text={retweet.quote.text}
          loading={retweet.quote.loading}
          onTextChange={retweet.quote.setText}
          onSubmit={retweet.quote.submit}
          onClose={retweet.quote.close}
        />
      )}

      {retweet.retweetedBy.isOpen && (
        <UsersModal
          title="Retuitado por"
          users={retweet.retweetedBy.users}
          loading={retweet.retweetedBy.loading}
          emptyMessage="Nenhum retuite ainda."
          onClose={retweet.retweetedBy.close}
          onToggleFollow={retweet.retweetedBy.toggleFollow}
        />
      )}

      {likesModal.isOpen && (
        <UsersModal
          title={likesModal.title}
          users={likesModal.users}
          loading={likesModal.loading}
          emptyMessage="Nenhuma curtida ainda."
          onClose={likesModal.close}
          onToggleFollow={likesModal.toggleFollow}
        />
      )}
    </Container>
  );
};

export default Tweet;
