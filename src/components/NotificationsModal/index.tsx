import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Overlay,
  ModalContainer,
  Header,
  CloseButton,
  ScrollableContent,
  NotificationItem,
  UnreadDot,
  IconArea,
  ContentArea,
  UserAvatar,
  UserInfo,
  TweetPreview,
  LikeIcon,
  RetweetIcon,
  CommentIcon,
  PostIcon,
  FollowIcon,
  LoadingState,
  EmptyState,
} from './styles';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface Notification {
  id: string | number;
  type: 'like' | 'retweet' | 'comment' | 'post' | 'follow';
  actor?: {
    username: string;
    first_name?: string;
    profile?: {
      avatar?: string;
    };
  };
  user?: {
    name: string;
    username: string;
    avatar: string;
  };
  text?: string;
  content?: string;
  tweet?: string | number | null;
  tweet_id?: string | number | null;
  comment?: string | number | null;
  comment_id?: string | number | null;
  object_id?: string | number | null;
  target_id?: string | number | null;
  is_read?: boolean;
}

const NotificationsModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/');
        if (!isMounted) return;

        const dataList = Array.isArray(res.data)
          ? res.data
          : res.data?.results || res.data?.notifications || [];

        if (Array.isArray(dataList)) {
          // 🛡️ Filtro cirúrgico por assinatura exata (Autor + Tipo + Conteúdo)
          const seen = new Set<string>();
          const uniqueList: Notification[] = [];

          dataList.forEach((item: Notification) => {
            const actor =
              item.user?.username || item.actor?.username || 'unknown';
            const type = item.type || 'default';
            const content = (item.content || item.text || '').trim();

            const signature = `${actor}-${type}-${content}`;

            if (!seen.has(signature)) {
              seen.add(signature);
              uniqueList.push(item);
            }
          });

          setNotifications(uniqueList);
        }
      } catch (err) {
        console.error('Erro ao buscar notificações:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (notif.is_read === false) {
      try {
        await api.post(`/notifications/${notif.id}/read/`).catch(() => {});
      } catch {
        // Ignora caso a rota falhe
      }
    }

    const targetTweetId = notif.tweet_id || notif.tweet;
    const targetCommentId =
      notif.comment_id || notif.comment || notif.object_id || notif.target_id;
    const actorUsername = notif.user?.username || notif.actor?.username;

    onClose();

    if (notif.type === 'follow' && actorUsername && !targetTweetId) {
      navigate(`/profile/${actorUsername}`);
      return;
    }

    if (targetTweetId) {
      const isCommentOrReply =
        notif.type === 'comment' ||
        Boolean(targetCommentId) ||
        notif.type === 'like' ||
        notif.type === 'retweet';

      if (isCommentOrReply) {
        navigate(`/status/${targetTweetId}`, {
          state: {
            fromNotification: true,
            openComments: true,
            highlightCommentId: targetCommentId || undefined,
          },
        });
      } else {
        navigate(`/status/${targetTweetId}`);
      }
    } else if (actorUsername) {
      navigate(`/profile/${actorUsername}`);
    }
  };

  const handleUserClick = (e: React.MouseEvent, username?: string) => {
    e.stopPropagation();
    onClose();

    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <LikeIcon />;
      case 'retweet':
        return <RetweetIcon />;
      case 'comment':
        return <CommentIcon />;
      case 'follow':
        return <FollowIcon />;
      default:
        return <PostIcon />;
    }
  };

  const modalContent = (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>Notificações</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        <ScrollableContent>
          {loading ? (
            <LoadingState>A carregar...</LoadingState>
          ) : notifications.length === 0 ? (
            <EmptyState>Sem notificações de momento.</EmptyState>
          ) : (
            notifications.map((notif, index) => {
              const username =
                notif.user?.name ||
                notif.actor?.first_name ||
                notif.actor?.username ||
                'Alguém';
              const rawUsername = notif.user?.username || notif.actor?.username;
              const avatar =
                notif.user?.avatar ||
                notif.actor?.profile?.avatar ||
                '/default-avatar.png';

              const isUnread = notif.is_read === false;
              const isComment = notif.type === 'comment';

              return (
                <NotificationItem
                  key={notif.id || index}
                  onClick={() => handleNotificationClick(notif)}
                  $isUnread={isUnread}
                >
                  {isUnread && <UnreadDot />}

                  <IconArea>{renderIcon(notif.type)}</IconArea>
                  <ContentArea>
                    <UserAvatar
                      $avatarUrl={avatar}
                      onClick={(e) => handleUserClick(e, rawUsername)}
                    />
                    <UserInfo>
                      <strong onClick={(e) => handleUserClick(e, rawUsername)}>
                        {username}
                      </strong>{' '}
                      <span>
                        {notif.text || getNotificationText(notif.type)}
                      </span>
                    </UserInfo>
                    {notif.content && (
                      <TweetPreview $isComment={isComment}>
                        {notif.content}
                      </TweetPreview>
                    )}
                  </ContentArea>
                </NotificationItem>
              );
            })
          )}
        </ScrollableContent>
      </ModalContainer>
    </Overlay>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

function getNotificationText(type: string): string {
  switch (type) {
    case 'like':
      return 'gostou do seu tweet.';
    case 'comment':
      return 'respondeu ao seu tweet.';
    case 'retweet':
      return 'retweetou o seu tweet.';
    case 'follow':
      return 'começou a segui-lo.';
    case 'post':
      return 'publicou um novo tweet.';
    default:
      return 'interagiu consigo.';
  }
}

export default NotificationsModal;
