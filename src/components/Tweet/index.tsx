import React, { useState } from 'react';
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
    avatar?: string;
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
}

interface TweetProps {
  tweet: ITweetData;
  onDelete?: (tweetId: number | string) => void;
  onUpdate?: () => void;
}

const Tweet: React.FC<TweetProps> = ({ tweet, onDelete, onUpdate }) => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isImageOpen, setIsImageOpen] = useState(false);

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

  const [commentsCount, setCommentsCount] = useState(tweet.comments_count || 0);
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [comments, setComments] = useState<IComment[]>(tweet.comments || []);
  const [loadingCommentsList, setLoadingCommentsList] = useState(false);

  const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);

  const [replyingTo, setReplyingTo] = useState<{
    id: number | string;
    username: string;
  } | null>(null);

  const isOwner = user?.username === tweet.author.username;

  const [prevTweetComments, setPrevTweetComments] = useState(tweet.comments);
  const [prevTweetCommentsCount, setPrevTweetCommentsCount] = useState(
    tweet.comments_count
  );

  if (tweet.comments !== prevTweetComments) {
    setPrevTweetComments(tweet.comments);
    if (tweet.comments) setComments(tweet.comments);
  }

  if (tweet.comments_count !== prevTweetCommentsCount) {
    setPrevTweetCommentsCount(tweet.comments_count);
    if (tweet.comments_count !== undefined)
      setCommentsCount(tweet.comments_count);
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Deseja realmente apagar esta postagem?'
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/tweets/${tweet.id}/`);
      if (isOwner && user) {
        const currentTweets =
          (user as { tweets_count?: number }).tweets_count ?? 0;
        updateUser({
          ...user,
          tweets_count: Math.max(0, currentTweets - 1),
        } as typeof user & { tweets_count: number });
      }
      if (onDelete) onDelete(tweet.id);
    } catch (error) {
      console.error('Erro ao deletar tweet:', error);
      alert('Não foi possível deletar o tweet.');
    }
  };

  const handleLikeTweet = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/tweets/${tweet.id}/like/`);
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
      const response = await api.get(`/tweets/${tweet.id}/`);
      if (response.data && response.data.liked_by) {
        setLikedByUsers(response.data.liked_by);
      }
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
      const response = await api.get(`/comments/${commentId}/`);
      if (response.data && response.data.liked_by) {
        setLikedByUsers(response.data.liked_by);
      }
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
      const response = await api.post(`/users/${targetUser.username}/follow/`);
      if (response.status === 200 || response.status === 201) {
        setLikedByUsers((prev) =>
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

  const handleRetweet = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/tweets/${tweet.id}/retweet/`);
      if (response.status === 200 || response.status === 201) {
        setRetweetsCount((prev) => (isRetweeted ? prev - 1 : prev + 1));
        setIsRetweeted(!isRetweeted);
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao retuitar:', error);
    }
  };

  const fetchComments = async () => {
    setLoadingCommentsList(true);
    try {
      const response = await api.get(`/tweets/${tweet.id}/`);
      if (response.data && response.data.comments) {
        setComments(response.data.comments);
      }
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

    if (willOpen && comments.length === 0 && commentsCount > 0) {
      fetchComments();
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoadingComment(true);
    try {
      await api.post(`/tweets/${tweet.id}/comment/`, {
        content: commentText.trim(),
        parent: replyingTo?.id || null,
      });

      setCommentsCount((prev) => prev + 1);
      setCommentText('');
      setReplyingTo(null);

      fetchComments();
      if (onUpdate) onUpdate();
    } catch (error) {
      // CORREÇÃO: Removida a tipagem :any do erro
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
      await api.post(`/comments/${commentId}/like/`);
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
    }
  };

  const handleReplyClick = (e: React.MouseEvent, comment: IComment) => {
    e.stopPropagation();
    setReplyingTo({ id: comment.id, username: comment.author.username });
  };

  const formattedDate = new Date(tweet.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  const getAvatarUrl = (avatarPath?: string) => {
    if (!avatarPath) return 'none';

    let baseURL = 'http://localhost:8000';

    // CORREÇÃO: Utilizando unknown no lugar de any
    const meta = import.meta as unknown as { env: Record<string, string> };
    if (typeof import.meta !== 'undefined' && meta.env) {
      baseURL = meta.env.VITE_API_URL || baseURL;
    }

    return avatarPath.startsWith('http')
      ? `url(${avatarPath})`
      : `url(${baseURL}${avatarPath})`;
  };

  const renderCommentTree = (commentList: IComment[], isNested = false) => {
    return commentList.map((comment, index) => (
      <React.Fragment key={`${comment.id}-${index}`}>
        <CommentItem className={isNested ? 'is-reply' : ''}>
          <CommentAvatar
            style={{
              backgroundImage: getAvatarUrl(comment.author.profile?.avatar),
            }}
          />
          <CommentContentContainer>
            <div>
              <strong>
                {comment.author.first_name || comment.author.username}
              </strong>
              <span>@{comment.author.username}</span>
            </div>
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
    <Container>
      {tweet.isRetweet && (
        <Retweeted>
          <Icon />
          Você retweetou
        </Retweeted>
      )}

      <Body>
        <Avatar
          style={
            tweet.author.profile?.avatar
              ? {
                  backgroundImage: getAvatarUrl(tweet.author.profile.avatar),
                  backgroundSize: 'cover',
                }
              : undefined
          }
        />

        <Content>
          <Header>
            <HeaderInfo>
              <strong>
                {tweet.author.first_name || tweet.author.username}
              </strong>
              <span>@{tweet.author.username}</span>
              <Dot />
              <time>{formattedDate}</time>
            </HeaderInfo>

            {isOwner && (
              <DeleteButton onClick={handleDelete} title="Deletar tweet">
                🗑️
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
                  style={{ backgroundImage: `url(${tweet.media})` }}
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

          <Icons>
            <Status onClick={handleToggleComments}>
              <CommentIcon />
              {commentsCount}
            </Status>

            <Status
              onClick={handleRetweet}
              className={isRetweeted ? 'active-retweet' : ''}
              $isRetweeted={isRetweeted}
            >
              <RetweetIcon />
              {retweetsCount}
            </Status>

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
        <ModalOverlay
          onClick={(e) => {
            e.stopPropagation();
            setIsCommentSectionOpen(false);
          }}
        >
          <LikesModalContainer
            onClick={(e) => e.stopPropagation()}
            $isCommentModal
          >
            <LikesModalHeader>
              <h3>Comentários</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommentSectionOpen(false);
                }}
              >
                ✕
              </button>
            </LikesModalHeader>

            <CommentScrollArea>
              <CommentSection>
                <CommentsList>
                  {loadingCommentsList ? (
                    <CommentListLoading>
                      Carregando comentários...
                    </CommentListLoading>
                  ) : comments.length > 0 ? (
                    <>
                      {renderCommentTree(
                        comments.slice(0, visibleCommentsCount)
                      )}

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
                  <button type="button" onClick={() => setReplyingTo(null)}>
                    Cancelar
                  </button>
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLikesModalOpen(false);
                }}
              >
                ✕
              </button>
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
                          style={{
                            backgroundImage: getAvatarUrl(
                              likedUser.profile?.avatar
                            ),
                          }}
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
