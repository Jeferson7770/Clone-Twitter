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

    api.post('/notifications/').catch((err) => {
      console.error('Erro ao marcar notificações como lidas:', err);
    });

    const fetchNotifications = (isInitial = false) => {
      if (isInitial) setLoading(true);

      api
        .get('/notifications/')
        .then((res) => {
          if (isMounted && Array.isArray(res.data)) {
            setNotifications(res.data);
          }
        })
        .catch((err) => {
          console.error('Erro ao buscar notificações:', err);
        })
        .finally(() => {
          if (isMounted && isInitial) setLoading(false);
        });
    };

    fetchNotifications(true);

    const intervalId = setInterval(() => fetchNotifications(false), 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleNotificationClick = (notif: Notification) => {
    const targetTweetId = notif.tweet_id || notif.tweet;
    const actorUsername = notif.user?.username || notif.actor?.username;

    onClose();

    if (notif.type === 'follow' && actorUsername) {
      navigate(`/profile/${actorUsername}`);
    } else if (targetTweetId) {
      navigate(`/status/${targetTweetId}`);
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
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--gray)',
              }}
            >
              A carregar...
            </div>
          ) : notifications.length === 0 ? (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--gray)',
              }}
            >
              Nenhuma notificação no momento.
            </div>
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

              return (
                <NotificationItem
                  key={`${notif.id}-${index}`}
                  onClick={() => handleNotificationClick(notif)}
                  style={{ cursor: 'pointer' }}
                >
                  <IconArea>{renderIcon(notif.type)}</IconArea>
                  <ContentArea>
                    <UserAvatar
                      style={{
                        backgroundImage: `url(${avatar})`,
                        cursor: 'pointer',
                      }}
                      onClick={(e) => handleUserClick(e, rawUsername)}
                    />
                    <UserInfo>
                      <strong
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => handleUserClick(e, rawUsername)}
                      >
                        {username}
                      </strong>{' '}
                      <span>
                        {notif.text || getNotificationText(notif.type)}
                      </span>
                    </UserInfo>
                    {notif.content && (
                      <TweetPreview>{notif.content}</TweetPreview>
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
      return 'curtiu o seu tweet.';
    case 'comment':
      return 'comentou no seu tweet.';
    case 'retweet':
      return 'retweetou o seu tweet.';
    case 'follow':
      return 'começou a seguir você.';
    case 'post':
      return 'publicou um novo tweet.';
    default:
      return 'interagiu com você.';
  }
}

export default NotificationsModal;
