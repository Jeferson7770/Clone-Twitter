import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CommentForm,
  CommentActions,
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
  ReplyIndicator,
  CommentListLoading,
  CommentListEmpty,
  LoadMoreButton,
  CommentScrollArea,
  CommentFormArea,
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
  CommentHeaderBar,
  CommentHeaderTitle,
  CloseCommentsButton,
  CancelReplyButton,
  RetweetCountSpan,
  TrashIconSpan,
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
  const { user, updateUser } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const [isRetweetsModalOpen, setIsRetweetsModalOpen] = useState(false);
  const [retweetedByUsers, setRetweetedByUsers] = useState<ILikedUser[]>([]);
  const [loadingRetweetedBy, setLoadingRetweetedBy] = useState(false);

  const [commentsCount, setCommentsCount] = useState(tweet.comments_count || 0);
  const [comments, setComments] = useState<IComment[]>(tweet.comments || []);

  const [prevTweetComments, setPrevTweetComments] = useState(tweet.comments);
  const [prevTweetCommentsCount, setPrevTweetCommentsCount] = useState(
    tweet.comments_count
  );

  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingCommentsList, setLoadingCommentsList] = useState(false);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);
  const [replyingTo, setReplyingTo] = useState<{
    id: number | string;
    username: string;
  } | null>(null);

  const isOwner = user?.username === tweet.author.username;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isCommentSectionOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsCommentSectionOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCommentSectionOpen]);

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
    const userConfirmed = window.confirm(
      'Excluir Tweet?\n\nIsso não pode ser desfeito e ele será removido do seu perfil, da timeline das contas que seguem você e dos resultados de busca.'
    );

    if (userConfirmed) {
      confirmDelete();
    }
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
        alert('Não foi possível deletar o tweet.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteComment = async (
    e: React.MouseEvent,
    commentId: number | string
  ) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      'Excluir este comentário?\n\nIsso não pode ser desfeito.'
    );
    if (!confirmDelete) return;

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
      alert('Não foi possível deletar o comentário.');
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
      alert('Não foi possível realizar esta ação no momento.');
    }
  };

  const handleRetweetMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRetweetMenu(!showRetweetMenu);
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

  const fetchComments = async () => {
    setLoadingCommentsList(true);
    try {
      const response = await api.get(`tweets/${tweet.id}/`);
      if (response.data && response.data.comments)
        setComments(response.data.comments);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    } finally {
      setLoadingCommentsList(false);
    }
  };

  const handleToggleComments = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const willOpen = !isCommentSectionOpen;
    setIsCommentSectionOpen(willOpen);
    if (willOpen && comments.length === 0 && commentsCount > 0) fetchComments();
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
      setCommentsCount((prev) => prev + 1);
      setCommentText('');
      setReplyingTo(null);
      fetchComments();
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
    setReplyingTo({ id: comment.id, username: comment.author.username });
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
    return commentList.map((comment, index) => (
      <React.Fragment key={`${comment.id}-${index}`}>
        <CommentItem className={isNested ? 'is-reply' : ''}>
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
            <p>{comment.content}</p>
            <CommentItemActions>
              <ActionWrapper
                onClick={(e) => handleReplyClick(e, comment)}
                title="Responder"
              >
                <CommentIcon />
                <span>{comment.replies_count || 0}</span>
              </ActionWrapper>

              <ActionWrapper
                onClick={(e) => handleLikeComment(e, comment.id)}
                $isLiked={comment.is_liked}
                title="Curtir"
              >
                <LikeIcon $isLiked={comment.is_liked} />
                <LikeCountSpan
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
          </CommentContentContainer>
        </CommentItem>
        {comment.replies && comment.replies.length > 0 && (
          <NestedRepliesContainer $isNested={isNested}>
            {renderCommentTree(comment.replies, true)}
          </NestedRepliesContainer>
        )}
      </React.Fragment>
    ));
  };

  return (
    <Container ref={containerRef} onClick={() => setShowRetweetMenu(false)}>
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
                {isDeleting ? '⏳' : '🗑️'}
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
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                ))}
            </QuotedTweetCard>
          )}

          <Icons>
            <Status onClick={handleToggleComments}>
              <CommentIcon />
              {commentsCount}
            </Status>

            <RetweetWrapper>
              <Status
                onClick={handleRetweetMenuClick}
                className={isRetweeted ? 'active-retweet' : ''}
                $isRetweeted={isRetweeted}
              >
                <RetweetIcon />
                <RetweetCountSpan
                  onClick={handleOpenRetweetsModal}
                  title="Ver quem retuitou"
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
              >
                {likesCount}
              </span>
            </Status>
          </Icons>
        </Content>
      </Body>

      {isCommentSectionOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'relative' }}
        >
          <CommentHeaderBar>
            <CommentHeaderTitle>Respostas</CommentHeaderTitle>
            <CloseCommentsButton
              type="button"
              onClick={() => setIsCommentSectionOpen(false)}
              title="Fechar respostas"
            >
              ✕
            </CloseCommentsButton>
          </CommentHeaderBar>

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
                          setVisibleCommentsCount((prev) => prev + 5);
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

          <CommentFormArea>
            {replyingTo && (
              <ReplyIndicator>
                <span>
                  Respondendo a <strong>@{replyingTo.username}</strong>
                </span>
                <CancelReplyButton
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  title="Cancelar resposta"
                >
                  ✕
                </CancelReplyButton>
              </ReplyIndicator>
            )}
            <CommentForm onSubmit={handleCommentSubmit}>
              <textarea
                rows={2}
                placeholder={
                  replyingTo
                    ? 'Escreva sua resposta...'
                    : 'Postar sua resposta...'
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <CommentActions>
                <button
                  type="submit"
                  disabled={loadingComment || !commentText.trim()}
                >
                  {loadingComment ? 'Enviando...' : 'Postar'}
                </button>
              </CommentActions>
            </CommentForm>
          </CommentFormArea>
        </div>
      )}

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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsQuoteModalOpen(false);
                }}
              >
                ✕
              </button>
            </LikesModalHeader>

            <CommentFormArea>
              <CommentForm onSubmit={handleQuoteSubmit}>
                <QuotePreview>
                  <strong>
                    {tweet.author.first_name || tweet.author.username}{' '}
                    <span>@{tweet.author.username}</span>
                  </strong>
                  <p>{tweet.content}</p>
                </QuotePreview>

                <textarea
                  rows={3}
                  placeholder="Adicione um comentário..."
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  autoFocus
                />

                <CommentActions>
                  <button
                    type="submit"
                    disabled={loadingQuote || !quoteText.trim()}
                  >
                    {loadingQuote ? 'Enviando...' : 'Postar'}
                  </button>
                </CommentActions>
              </CommentForm>
            </CommentFormArea>
          </LikesModalContainer>
        </ModalOverlay>
      )}

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
                        navigate(`/${retweetUser.username}`);
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
                          type="button"
                          className={
                            retweetUser.is_following ? 'following' : 'follow'
                          }
                          onClick={(e) => handleToggleFollow(e, retweetUser)}
                        >
                          {retweetUser.is_following ? 'A seguir' : 'Seguir'}
                        </button>
                      )}
                    </LikeUserItem>
                  );
                })
              ) : (
                <LikesModalEmpty>Nenhum retweet ainda.</LikesModalEmpty>
              )}
            </LikesList>
          </LikesModalContainer>
        </ModalOverlay>
      )}

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
                        navigate(`/${likedUser.username}`);
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
                          type="button"
                          className={
                            likedUser.is_following ? 'following' : 'follow'
                          }
                          onClick={(e) => handleToggleFollow(e, likedUser)}
                        >
                          {likedUser.is_following ? 'A seguir' : 'Seguir'}
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
