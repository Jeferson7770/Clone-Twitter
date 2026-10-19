import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

import {
  Container,
  Retweeted,
  Icon,
  Body,
  Avatar,
  Content,
  Header,
  HeaderInfo,
  DeleteButton,
  Dot,
  Description,
  ImageContent,
  VideoContent,
  ImageModalOverlay,
  ModalContentBox,
  CloseImageButton,
  ExpandedImage,
  Icons,
  Status,
  CommentIcon,
  RetweetIcon,
  LikeIcon,
  CommentSection,
  CommentsList,
  CommentItem,
  CommentAvatar,
  CommentContentContainer,
  ModalOverlay,
  LikesModalContainer,
  LikesModalHeader,
  LikesList,
  LikeUserItem,
  LikeUserAvatar,
  LikeUserInfo,
  CommentListLoading,
  CommentListEmpty,
  LoadMoreButton,
  CommentScrollArea,
  CommentItemActions,
  ActionWrapper,
  LikeCountSpan,
  NestedRepliesContainer,
  LikesModalLoading,
  LikesModalEmpty,
  LikeUserInner,
  RetweetWrapper,
  RetweetDropdown,
  DropdownItem,
  QuotePreview,
  QuotedTweetCard,
  QuotedHeader,
  QuotedAvatar,
  QuotedContent,
  CommentAuthorContainer,
  TrashIconSpan,
  DeleteModalCard,
  DeleteModalText,
  DeleteModalRowActions,
  ReplyModalContainer,
  ReplyModalHeader,
  ReplyModalBody,
  ReplyTweetParent,
  ReplyThreadLine,
  ReplyFormContainer,
  ReplyReplyingToText,
  ReplySubmitButton,
  ReplyingToTag,
  ToggleRepliesButton,
  RetweetCountSpan,
} from './styles';

export interface IComment {
  id: number | string;
  content: string;
  created_at: string;
  author: {
    first_name: string;
    username: string;
    profile?: {
      avatar?: string;
    };
  };
  likes_count?: number;
  is_liked?: boolean;
  replies_count?: number;
  replies?: IComment[];
  parent?: number | string | null;
  media?: string | null;
  media_type?: 'image' | 'video';
}

export interface ILikedUser {
  id: number | string;
  username: string;
  first_name?: string;
  is_following?: boolean;
  profile?: {
    avatar?: string | null;
  };
}

export interface ITweetData {
  id: number | string;
  content: string;
  created_at: string;
  author: {
    id?: number | string;
    first_name: string;
    username: string;
    profile?: {
      avatar?: string;
    };
  };
  likes_count?: number;
  retweets_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  is_retweeted?: boolean;
  media?: string | null;
  media_type?: 'image' | 'video';
  isRetweet?: boolean;
  comments?: IComment[];
  liked_by?: ILikedUser[];
  quoted_tweet?: ITweetData | null;
}

interface TweetProps {
  tweet: ITweetData;
  onDelete?: (tweetId: number | string) => void;
  onUpdate?: () => void;
}

const Tweet: React.FC<TweetProps> = ({ tweet, onDelete, onUpdate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();

  const locationState = location.state as {
    highlightCommentId?: string | number;
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const retweetMenuRef = useRef<HTMLDivElement>(null);
  const commentMenuRef = useRef<HTMLDivElement>(null);
  const commentSectionRef = useRef<HTMLDivElement>(null);

  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [likesCount, setLikesCount] = useState(tweet.likes_count || 0);
  const [isLiked, setIsLiked] = useState(tweet.is_liked || false);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [likesModalTitle, setLikesModalTitle] = useState('Curtido por');
  const [likedByUsers, setLikedByUsers] = useState<ILikedUser[]>(
    tweet.liked_by || []
  );
  const [loadingLikedBy, setLoadingLikedBy] = useState(false);

  const [retweetsCount, setRetweetsCount] = useState(tweet.retweets_count || 0);
  const [isRetweeted, setIsRetweeted] = useState(tweet.is_retweeted || false);
  const [showRetweetMenu, setShowRetweetMenu] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [loadingQuote, setLoadingQuote] = useState(false);

  const [showCommentMenu, setShowCommentMenu] = useState(false);

  const [isRetweetsModalOpen, setIsRetweetsModalOpen] = useState(false);
  const [retweetedByUsers, setRetweetedByUsers] = useState<ILikedUser[]>([]);
  const [loadingRetweetedBy, setLoadingRetweetedBy] = useState(false);

  const [commentsCount, setCommentsCount] = useState(tweet.comments_count || 0);
  const [comments, setComments] = useState<IComment[]>(tweet.comments || []);

  const [prevTweetComments, setPrevTweetComments] = useState(tweet.comments);
  const [prevTweetCommentsCount, setPrevTweetCommentsCount] = useState(
    tweet.comments_count
  );

  // Derivação de estado para evitar chamadas de setState síncronas dentro de useEffects
  const hasNotificationHighlight = Boolean(locationState?.highlightCommentId);
  const [manualOpen, setManualOpen] = useState(false);
  const [extraVisibleCount, setExtraVisibleCount] = useState(0);

  const isCommentSectionOpen = hasNotificationHighlight || manualOpen;
  const visibleCommentsCount =
    (hasNotificationHighlight ? 100 : 3) + extraVisibleCount;

  const [highlightedCommentId] = useState<number | string | null>(
    locationState?.highlightCommentId ?? null
  );

  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingCommentsList, setLoadingCommentsList] = useState(false);

  const [replyingTo, setReplyingTo] = useState<IComment | null>(null);
  const [expandedComments, setExpandedComments] = useState<
    Record<string | number, boolean>
  >({});

  const fetchComments = useCallback(async () => {
    setLoadingCommentsList(true);
    try {
      const response = await api.get(`tweets/${tweet.id}/`);
      if (response.data && response.data.comments) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    } finally {
      setLoadingCommentsList(false);
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

    const findParentsToExpand = (
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

  const toggleShowReplies = (commentId: string | number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const isOwner = user?.username === tweet.author.username;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        showRetweetMenu &&
        retweetMenuRef.current &&
        !retweetMenuRef.current.contains(target)
      ) {
        setShowRetweetMenu(false);
      }
      if (
        showCommentMenu &&
        commentMenuRef.current &&
        !commentMenuRef.current.contains(target)
      ) {
        setShowCommentMenu(false);
      }
      if (
        isCommentSectionOpen &&
        commentSectionRef.current &&
        !commentSectionRef.current.contains(target) &&
        commentMenuRef.current &&
        !commentMenuRef.current.contains(target)
      ) {
        setManualOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRetweetMenu, showCommentMenu, isCommentSectionOpen]);

  if (tweet.comments !== prevTweetComments) {
    setPrevTweetComments(tweet.comments);
    setComments(tweet.comments || []);
  }

  if (tweet.comments_count !== prevTweetCommentsCount) {
    setPrevTweetCommentsCount(tweet.comments_count);
    setCommentsCount(tweet.comments_count || 0);
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleSuccessfulDelete = () => {
    if (isOwner && user) {
      const currentTweets =
        (user as { tweets_count?: number }).tweets_count ?? 0;
      updateUser({
        ...user,
        tweets_count: Math.max(0, currentTweets - 1),
      } as typeof user & { tweets_count: number });
    }
    if (onDelete) onDelete(tweet.id);
  };

  const confirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await api.delete(`tweets/${tweet.id}/`);
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
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteComment = async (
    e: React.MouseEvent,
    commentId: number | string
  ) => {
    e.stopPropagation();
    const confirmDeleteComment = window.confirm(
      'Excluir este comentário?\n\nIsso não pode ser desfeito.'
    );
    if (!confirmDeleteComment) return;

    try {
      await api.delete(`comments/${commentId}/`);

      const removeCommentFromTree = (commentsList: IComment[]): IComment[] => {
        return commentsList
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies ? removeCommentFromTree(c.replies) : [],
          }));
      };

      setComments((prev) => removeCommentFromTree(prev));
      setCommentsCount((prev) => Math.max(0, prev - 1));

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
    }
  };

  const handleLikeTweet = async (e: React.MouseEvent) => {
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

  const handleOpenTweetLikesModal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikesModalTitle('Curtido por');
    setIsLikesModalOpen(true);
    setLoadingLikedBy(true);
    try {
      const response = await api.get(`tweets/${tweet.id}/`);
      if (response.data && response.data.liked_by)
        setLikedByUsers(response.data.liked_by);
    } catch (error) {
      console.error('Erro ao buscar lista de quem curtiu o tweet:', error);
    } finally {
      setLoadingLikedBy(false);
    }
  };

  const handleOpenCommentLikesModal = async (
    e: React.MouseEvent,
    commentId: number | string
  ) => {
    e.stopPropagation();
    setLikesModalTitle('Curtidas do comentário');
    setIsLikesModalOpen(true);
    setLoadingLikedBy(true);
    try {
      const response = await api.get(`comments/${commentId}/`);
      if (response.data && response.data.liked_by)
        setLikedByUsers(response.data.liked_by);
    } catch (error) {
      console.error('Erro ao buscar lista de quem curtiu o comentário:', error);
    } finally {
      setLoadingLikedBy(false);
    }
  };

  const handleToggleFollow = async (
    e: React.MouseEvent,
    targetUser: ILikedUser
  ) => {
    e.stopPropagation();
    try {
      const response = await api.post(`users/${targetUser.username}/follow/`);
      if (response.status === 200 || response.status === 201) {
        setLikedByUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, is_following: !u.is_following } : u
          )
        );
        setRetweetedByUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, is_following: !u.is_following } : u
          )
        );
      }
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error);
    }
  };

  const handleRetweetMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCommentMenu(false);
    setShowRetweetMenu(!showRetweetMenu);
  };

  const handleCommentMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRetweetMenu(false);
    setShowCommentMenu(!showCommentMenu);
  };

  const handleOpenReplyModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCommentMenu(false);
    setReplyingTo(null);
    setIsReplyModalOpen(true);
  };

  const handleOpenAllComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCommentMenu(false);
    const willOpen = !isCommentSectionOpen;
    setManualOpen(willOpen);
    if (willOpen && comments.length === 0 && commentsCount > 0) fetchComments();
  };

  const handleStandardRetweet = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRetweetMenu(false);
    try {
      const response = await api.post(`tweets/${tweet.id}/retweet/`);
      if (response.status === 200 || response.status === 201) {
        const nextIsRetweeted = !isRetweeted;
        setIsRetweeted(nextIsRetweeted);
        setRetweetsCount((prev) => (isRetweeted ? prev - 1 : prev + 1));

        if (user) {
          if (nextIsRetweeted) {
            setRetweetedByUsers((prev) => {
              const exists = prev.some((u) => u.username === user.username);
              if (exists) return prev;
              return [
                {
                  id: user.id || '',
                  username: user.username,
                  first_name: user.first_name,
                  profile: user.profile,
                  is_following: false,
                },
                ...prev,
              ];
            });
          } else {
            setRetweetedByUsers((prev) =>
              prev.filter((u) => u.username !== user.username)
            );
          }
        }
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao retuitar:', error);
    }
  };

  const handleOpenQuoteModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRetweetMenu(false);
    setIsQuoteModalOpen(true);
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim()) return;
    setLoadingQuote(true);
    try {
      await api.post(`tweets/${tweet.id}/quote/`, {
        content: quoteText.trim(),
      });

      setRetweetsCount((prev) => prev + 1);
      setIsRetweeted(true);

      if (user) {
        setRetweetedByUsers((prev) => {
          const exists = prev.some((u) => u.username === user.username);
          if (exists) return prev;
          return [
            {
              id: user.id || '',
              username: user.username,
              first_name: user.first_name,
              profile: user.profile,
              is_following: false,
            },
            ...prev,
          ];
        });
      }

      setIsQuoteModalOpen(false);
      setQuoteText('');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao comentar no retweet:', error);
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleOpenRetweetsModal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRetweetsModalOpen(true);
    setLoadingRetweetedBy(true);
    try {
      const response = await api.get(`tweets/${tweet.id}/retweeted_by/`);
      let fetchedUsers: ILikedUser[] = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      if (isRetweeted && user) {
        const hasMe = fetchedUsers.some((u) => u.username === user.username);
        if (!hasMe) {
          fetchedUsers = [
            {
              id: user.id || '',
              username: user.username,
              first_name: user.first_name,
              profile: user.profile,
              is_following: false,
            },
            ...fetchedUsers,
          ];
        }
      }

      setRetweetedByUsers(fetchedUsers);
    } catch (error) {
      console.error('Erro ao buscar lista de quem retuitou:', error);
      if (isRetweeted && user) {
        setRetweetedByUsers([
          {
            id: user.id || '',
            username: user.username,
            first_name: user.first_name,
            profile: user.profile,
            is_following: false,
          },
        ]);
      }
    } finally {
      setLoadingRetweetedBy(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setLoadingComment(true);
    try {
      await api.post(`tweets/${tweet.id}/comment/`, {
        content: commentText.trim(),
        parent: replyingTo?.id || null,
      });

      if (replyingTo?.id) {
        setExpandedComments((prev) => ({
          ...prev,
          [replyingTo.id]: true,
        }));
      }

      setCommentsCount((prev) => prev + 1);
      setCommentText('');
      setReplyingTo(null);
      setIsReplyModalOpen(false);
      setManualOpen(true);

      await fetchComments();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao comentar:', error);
    } finally {
      setLoadingComment(false);
    }
  };

  const toggleLikeInTree = (
    commentsList: IComment[],
    targetId: number | string
  ): IComment[] => {
    return commentsList.map((comment) => {
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
  };

  const handleLikeComment = async (
    e: React.MouseEvent,
    commentId: number | string
  ) => {
    e.stopPropagation();
    setComments((prev) => toggleLikeInTree(prev, commentId));
    try {
      await api.post(`comments/${commentId}/like/`);
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
    }
  };

  const handleReplyClick = (e: React.MouseEvent, comment: IComment) => {
    e.stopPropagation();
    setReplyingTo(comment);
    setIsReplyModalOpen(true);
  };

  const handleUserClick = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    navigate(`/profile/${username}`);
  };

  const formattedDate = new Date(tweet.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  const getAvatarUrl = (avatarPath?: string | null) => {
    if (!avatarPath) return undefined;

    let baseURL = 'http://localhost:8000';
    const meta = import.meta as unknown as { env: Record<string, string> };
    if (typeof import.meta !== 'undefined' && meta.env) {
      baseURL = meta.env.VITE_API_URL || baseURL;
    }

    return avatarPath.startsWith('http')
      ? avatarPath
      : `${baseURL}${avatarPath}`;
  };

  const renderCommentTree = (commentList: IComment[], isNested = false) => {
    return commentList.map((comment, index) => {
      const hasReplies = comment.replies && comment.replies.length > 0;
      const isExpanded = expandedComments[comment.id];
      const isHighlighted = String(highlightedCommentId) === String(comment.id);

      return (
        <React.Fragment key={`${comment.id}-${index}`}>
          <CommentItem
            id={`comment-${comment.id}`}
            className={isNested ? 'is-reply' : ''}
            $isHighlighted={isHighlighted}
          >
            <CommentAvatar
              $avatarUrl={getAvatarUrl(comment.author.profile?.avatar)}
              onClick={(e) => handleUserClick(e, comment.author.username)}
            />
            <CommentContentContainer>
              <CommentAuthorContainer
                onClick={(e) => handleUserClick(e, comment.author.username)}
              >
                <strong>
                  {comment.author.first_name || comment.author.username}
                </strong>
                <span>@{comment.author.username}</span>
              </CommentAuthorContainer>

              {comment.parent && (
                <ReplyingToTag>
                  Em resposta a <span>@{comment.author.username}</span>
                </ReplyingToTag>
              )}

              <p>{comment.content}</p>

              <CommentItemActions>
                <ActionWrapper
                  onClick={(e) => handleReplyClick(e, comment)}
                  $isCommented={(comment.replies_count || 0) > 0}
                  title="Responder"
                >
                  <CommentIcon $hasReplies={(comment.replies_count || 0) > 0} />
                  <span>{comment.replies_count || 0}</span>
                </ActionWrapper>

                <ActionWrapper
                  onClick={(e) => handleLikeComment(e, comment.id)}
                  $isLiked={comment.is_liked}
                  title="Curtir"
                >
                  <LikeIcon $isLiked={comment.is_liked} />
                  <LikeCountSpan
                    style={{ color: comment.is_liked ? '#f91880' : 'inherit' }}
                    onClick={(e) => handleOpenCommentLikesModal(e, comment.id)}
                  >
                    {comment.likes_count || 0}
                  </LikeCountSpan>
                </ActionWrapper>

                {user?.username === comment.author.username && (
                  <ActionWrapper
                    onClick={(e) => handleDeleteComment(e, comment.id)}
                    title="Deletar Comentário"
                  >
                    <TrashIconSpan>🗑️</TrashIconSpan>
                  </ActionWrapper>
                )}
              </CommentItemActions>

              {hasReplies && !isNested && (
                <ToggleRepliesButton
                  type="button"
                  onClick={() => toggleShowReplies(comment.id)}
                >
                  <span className="line" />
                  {isExpanded
                    ? 'Ocultar respostas'
                    : `Ver ${comment.replies?.length} ${
                        comment.replies?.length === 1 ? 'resposta' : 'respostas'
                      }`}
                </ToggleRepliesButton>
              )}
            </CommentContentContainer>
          </CommentItem>

          {hasReplies && (isNested || isExpanded) && (
            <NestedRepliesContainer $isNested={true}>
              {renderCommentTree(comment.replies!, true)}
            </NestedRepliesContainer>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <Container ref={containerRef}>
      {tweet.isRetweet && (
        <Retweeted>
          <Icon />
          Você retweetou
        </Retweeted>
      )}

      <Body>
        <Avatar
          $avatarUrl={getAvatarUrl(tweet.author.profile?.avatar)}
          onClick={(e) => handleUserClick(e, tweet.author.username)}
        />

        <Content>
          <Header>
            <HeaderInfo
              onClick={(e) => handleUserClick(e, tweet.author.username)}
            >
              <strong>
                {tweet.author.first_name || tweet.author.username}
              </strong>
              <span>@{tweet.author.username}</span>
              <Dot />
              <time>{formattedDate}</time>
            </HeaderInfo>

            {isOwner && (
              <DeleteButton
                onClick={handleDeleteClick}
                title="Deletar tweet"
                disabled={isDeleting}
              >
                {isDeleting ? '⏳' : <TrashIconSpan>🗑️</TrashIconSpan>}
              </DeleteButton>
            )}
          </Header>

          {tweet.content && <Description>{tweet.content}</Description>}

          {tweet.media &&
            (tweet.media_type === 'video' ? (
              <VideoContent src={tweet.media} controls />
            ) : (
              <>
                <ImageContent
                  $mediaUrl={tweet.media}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsImageOpen(true);
                  }}
                  title="Clique para ampliar a imagem"
                />
                {isImageOpen && (
                  <ImageModalOverlay onClick={() => setIsImageOpen(false)}>
                    <ModalContentBox onClick={(e) => e.stopPropagation()}>
                      <CloseImageButton onClick={() => setIsImageOpen(false)}>
                        ✕
                      </CloseImageButton>
                      <ExpandedImage src={tweet.media} alt="Imagem ampliada" />
                    </ModalContentBox>
                  </ImageModalOverlay>
                )}
              </>
            ))}

          {tweet.quoted_tweet && (
            <QuotedTweetCard
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/status/${tweet.quoted_tweet?.id}`);
              }}
            >
              <QuotedHeader>
                <QuotedAvatar
                  $avatarUrl={getAvatarUrl(
                    tweet.quoted_tweet.author.profile?.avatar
                  )}
                  onClick={(e) =>
                    handleUserClick(e, tweet.quoted_tweet!.author.username)
                  }
                />
                <strong
                  onClick={(e) =>
                    handleUserClick(e, tweet.quoted_tweet!.author.username)
                  }
                >
                  {tweet.quoted_tweet.author.first_name ||
                    tweet.quoted_tweet.author.username}
                </strong>
                <span
                  onClick={(e) =>
                    handleUserClick(e, tweet.quoted_tweet!.author.username)
                  }
                >
                  @{tweet.quoted_tweet.author.username}
                </span>
              </QuotedHeader>

              {tweet.quoted_tweet.content && (
                <QuotedContent>{tweet.quoted_tweet.content}</QuotedContent>
              )}

              {tweet.quoted_tweet.media &&
                (tweet.quoted_tweet.media_type === 'video' ? (
                  <VideoContent
                    src={tweet.quoted_tweet.media}
                    controls
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <ImageContent
                    $mediaUrl={tweet.quoted_tweet.media}
                    onClick={(e) => e.stopPropagation()}
                  />
                ))}
            </QuotedTweetCard>
          )}

          <Icons>
            <RetweetWrapper ref={commentMenuRef}>
              <Status onClick={handleCommentMenuClick}>
                <CommentIcon />
                <span title="Opções de resposta">{commentsCount}</span>
              </Status>

              {showCommentMenu && (
                <RetweetDropdown>
                  <DropdownItem onClick={handleOpenReplyModal}>
                    Responder
                  </DropdownItem>
                  <DropdownItem onClick={handleOpenAllComments}>
                    Ver todas as respostas
                  </DropdownItem>
                </RetweetDropdown>
              )}
            </RetweetWrapper>

            <RetweetWrapper ref={retweetMenuRef}>
              <Status
                onClick={handleRetweetMenuClick}
                className={isRetweeted ? 'active-retweet' : ''}
                $isRetweeted={isRetweeted}
              >
                <RetweetIcon />
                <RetweetCountSpan
                  onClick={handleOpenRetweetsModal}
                  title="Ver quem retuitou"
                  style={{ color: isRetweeted ? '#00ba7c' : 'inherit' }}
                >
                  {retweetsCount}
                </RetweetCountSpan>
              </Status>

              {showRetweetMenu && (
                <RetweetDropdown>
                  <DropdownItem onClick={handleStandardRetweet}>
                    {isRetweeted ? 'Desfazer Retweet' : 'Retweetar'}
                  </DropdownItem>
                  <DropdownItem onClick={handleOpenQuoteModal}>
                    Comentar no Retweet
                  </DropdownItem>
                </RetweetDropdown>
              )}
            </RetweetWrapper>

            <Status className={isLiked ? 'active-like' : ''} $isLiked={isLiked}>
              <LikeIcon onClick={handleLikeTweet} $isLiked={isLiked} />
              <span
                onClick={handleOpenTweetLikesModal}
                className="clickable-likes"
                title="Ver quem curtiu"
                style={{ color: isLiked ? '#f91880' : 'inherit' }}
              >
                {likesCount}
              </span>
            </Status>
          </Icons>
        </Content>
      </Body>

      {/* SEÇÃO DE COMENTÁRIOS EXPANSÍVEL */}
      {isCommentSectionOpen && (
        <div ref={commentSectionRef} onClick={(e) => e.stopPropagation()}>
          <CommentScrollArea>
            <CommentSection>
              <CommentsList>
                {loadingCommentsList ? (
                  <CommentListLoading>
                    Carregando comentários...
                  </CommentListLoading>
                ) : comments.length > 0 ? (
                  <>
                    {renderCommentTree(comments.slice(0, visibleCommentsCount))}
                    {comments.length > visibleCommentsCount && (
                      <LoadMoreButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setExtraVisibleCount((prev) => prev + 5);
                        }}
                      >
                        Ver mais comentários...
                      </LoadMoreButton>
                    )}
                  </>
                ) : (
                  <CommentListEmpty>
                    Nenhum comentário ainda. Seja o primeiro!
                  </CommentListEmpty>
                )}
              </CommentsList>
            </CommentSection>
          </CommentScrollArea>
        </div>
      )}

      {/* MODAL DE RESPOSTA */}
      {isReplyModalOpen &&
        (() => {
          const isReplyingToComment = replyingTo !== null;
          const targetAuthor = isReplyingToComment
            ? replyingTo.author
            : tweet.author;
          const targetContent = isReplyingToComment
            ? replyingTo.content
            : tweet.content;
          const targetAvatar = targetAuthor.profile?.avatar;
          const targetUsername = targetAuthor.username;
          const targetName = targetAuthor.first_name || targetAuthor.username;

          const targetMedia = isReplyingToComment
            ? replyingTo.media
            : tweet.media;
          const targetMediaType = isReplyingToComment
            ? replyingTo.media_type
            : tweet.media_type;

          return (
            <ModalOverlay
              onClick={(e) => {
                e.stopPropagation();
                setIsReplyModalOpen(false);
              }}
            >
              <ReplyModalContainer onClick={(e) => e.stopPropagation()}>
                <ReplyModalHeader>
                  <button
                    type="button"
                    onClick={() => setIsReplyModalOpen(false)}
                    title="Fechar"
                  >
                    ✕
                  </button>
                </ReplyModalHeader>

                <ReplyModalBody>
                  <ReplyTweetParent>
                    <div className="left-column">
                      <Avatar $avatarUrl={getAvatarUrl(targetAvatar)} />
                      <ReplyThreadLine />
                    </div>
                    <div className="right-column">
                      <HeaderInfo>
                        <strong>{targetName}</strong>
                        <span>@{targetUsername}</span>
                        {!isReplyingToComment && (
                          <>
                            <Dot />
                            <time>{formattedDate}</time>
                          </>
                        )}
                      </HeaderInfo>

                      {targetContent && (
                        <Description>{targetContent}</Description>
                      )}

                      {targetMedia &&
                        (targetMediaType === 'video' ? (
                          <VideoContent src={targetMedia} controls />
                        ) : (
                          <ImageContent $mediaUrl={targetMedia} />
                        ))}
                    </div>
                  </ReplyTweetParent>

                  <ReplyFormContainer onSubmit={handleCommentSubmit}>
                    <div className="form-row">
                      <Avatar
                        $avatarUrl={getAvatarUrl(user?.profile?.avatar)}
                      />
                      <div className="right-column">
                        <ReplyReplyingToText>
                          Em resposta a <span>@{targetUsername}</span>
                        </ReplyReplyingToText>

                        <textarea
                          rows={3}
                          placeholder="Postar sua resposta..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="form-footer">
                      <ReplySubmitButton
                        type="submit"
                        disabled={loadingComment || !commentText.trim()}
                      >
                        {loadingComment ? 'Enviando...' : 'Responder'}
                      </ReplySubmitButton>
                    </div>
                  </ReplyFormContainer>
                </ReplyModalBody>
              </ReplyModalContainer>
            </ModalOverlay>
          );
        })()}

      {/* MODAL DE EXCLUSÃO DE TWEET */}
      {isDeleteModalOpen && (
        <ModalOverlay
          onClick={(e) => {
            e.stopPropagation();
            setIsDeleteModalOpen(false);
          }}
        >
          <DeleteModalCard onClick={(e) => e.stopPropagation()}>
            <h3>Excluir Tweet?</h3>
            <DeleteModalText>
              Isso não pode ser desfeito. Ele será removido do seu perfil, da
              linha do tempo de qualquer conta que segue você e dos resultados
              de busca.
            </DeleteModalText>
            <DeleteModalRowActions>
              <button
                className="cancel-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="confirm-btn"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </DeleteModalRowActions>
          </DeleteModalCard>
        </ModalOverlay>
      )}

      {/* MODAL DE QUOTE TWEET */}
      {isQuoteModalOpen && (
        <ModalOverlay
          onClick={(e) => {
            e.stopPropagation();
            setIsQuoteModalOpen(false);
          }}
        >
          <LikesModalContainer
            onClick={(e) => e.stopPropagation()}
            $isCommentModal
          >
            <LikesModalHeader>
              <h3>Comentar no Retweet</h3>
              <button onClick={() => setIsQuoteModalOpen(false)}>✕</button>
            </LikesModalHeader>

            <div style={{ padding: 16 }}>
              <form onSubmit={handleQuoteSubmit}>
                <textarea
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--white)',
                    outline: 'none',
                    fontSize: 18,
                  }}
                  placeholder="Adicione um comentário..."
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  autoFocus
                />

                <QuotePreview>
                  <strong>
                    {tweet.author.first_name || tweet.author.username}{' '}
                    <span>@{tweet.author.username}</span>
                  </strong>
                  <p>{tweet.content}</p>
                </QuotePreview>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: 12,
                  }}
                >
                  <ReplySubmitButton
                    type="submit"
                    disabled={loadingQuote || !quoteText.trim()}
                  >
                    {loadingQuote ? 'Enviando...' : 'Postar'}
                  </ReplySubmitButton>
                </div>
              </form>
            </div>
          </LikesModalContainer>
        </ModalOverlay>
      )}

      {/* MODAL DE QUEM RETUITOU */}
      {isRetweetsModalOpen && (
        <ModalOverlay
          onClick={(e) => {
            e.stopPropagation();
            setIsRetweetsModalOpen(false);
          }}
        >
          <LikesModalContainer onClick={(e) => e.stopPropagation()}>
            <LikesModalHeader>
              <h3>Retuitado por</h3>
              <button onClick={() => setIsRetweetsModalOpen(false)}>✕</button>
            </LikesModalHeader>

            <LikesList>
              {loadingRetweetedBy ? (
                <LikesModalLoading>Carregando...</LikesModalLoading>
              ) : retweetedByUsers && retweetedByUsers.length > 0 ? (
                retweetedByUsers.map((retweetUser, index) => {
                  const isMe = user?.username === retweetUser.username;
                  return (
                    <LikeUserItem
                      key={`${retweetUser.id}-${index}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRetweetsModalOpen(false);
                        navigate(`/profile/${retweetUser.username}`);
                      }}
                    >
                      <LikeUserInner>
                        <LikeUserAvatar
                          $avatarUrl={getAvatarUrl(retweetUser.profile?.avatar)}
                        />
                        <LikeUserInfo>
                          <strong>
                            {retweetUser.first_name || retweetUser.username}
                          </strong>
                          <span>@{retweetUser.username}</span>
                        </LikeUserInfo>
                      </LikeUserInner>
                      {!isMe && (
                        <button
                          className={
                            retweetUser.is_following ? 'following' : 'follow'
                          }
                          onClick={(e) => handleToggleFollow(e, retweetUser)}
                        >
                          {retweetUser.is_following ? 'Seguindo' : 'Seguir'}
                        </button>
                      )}
                    </LikeUserItem>
                  );
                })
              ) : (
                <LikesModalEmpty>Nenhum retuite ainda.</LikesModalEmpty>
              )}
            </LikesList>
          </LikesModalContainer>
        </ModalOverlay>
      )}

      {/* MODAL DE QUEM CURTIU */}
      {isLikesModalOpen && (
        <ModalOverlay
          onClick={(e) => {
            e.stopPropagation();
            setIsLikesModalOpen(false);
          }}
        >
          <LikesModalContainer onClick={(e) => e.stopPropagation()}>
            <LikesModalHeader>
              <h3>{likesModalTitle}</h3>
              <button onClick={() => setIsLikesModalOpen(false)}>✕</button>
            </LikesModalHeader>

            <LikesList>
              {loadingLikedBy ? (
                <LikesModalLoading>Carregando...</LikesModalLoading>
              ) : likedByUsers && likedByUsers.length > 0 ? (
                likedByUsers.map((likedUser, index) => {
                  const isMe = user?.username === likedUser.username;
                  return (
                    <LikeUserItem
                      key={`${likedUser.id}-${index}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLikesModalOpen(false);
                        navigate(`/profile/${likedUser.username}`);
                      }}
                    >
                      <LikeUserInner>
                        <LikeUserAvatar
                          $avatarUrl={getAvatarUrl(likedUser.profile?.avatar)}
                        />
                        <LikeUserInfo>
                          <strong>
                            {likedUser.first_name || likedUser.username}
                          </strong>
                          <span>@{likedUser.username}</span>
                        </LikeUserInfo>
                      </LikeUserInner>
                      {!isMe && (
                        <button
                          className={
                            likedUser.is_following ? 'following' : 'follow'
                          }
                          onClick={(e) => handleToggleFollow(e, likedUser)}
                        >
                          {likedUser.is_following ? 'Seguindo' : 'Seguir'}
                        </button>
                      )}
                    </LikeUserItem>
                  );
                })
              ) : (
                <LikesModalEmpty>Nenhuma curtida ainda.</LikesModalEmpty>
              )}
            </LikesList>
          </LikesModalContainer>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Tweet;
