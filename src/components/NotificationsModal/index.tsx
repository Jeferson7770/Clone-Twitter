import React, { useEffect, useRef, useState } from 'react';
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

  // IDs marcados como lidos localmente (ref: não dispara novo fetch)
  const locallyReadIdsRef = useRef<Set<string>>(new Set());

  // Contador incrementado a cada clique: gera um notifKey único
  // sem função impura (Date.now) e permite rolar de novo ao mesmo comentário
  const clickCounterRef = useRef(0);

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
          const seen = new Set<string>();
          const uniqueList: Notification[] = [];

          dataList.forEach((item: Notification, index: number) => {
            const idKey =
              item.id !== undefined ? String(item.id) : `idx-${index}`;

            const actor =
              item.user?.username || item.actor?.username || 'unknown';
            const tweetId = item.tweet_id ?? item.tweet ?? null;
            const commentId =
              item.comment_id ??
              item.comment ??
              (item.type === 'comment' ? item.object_id : null) ??
              null;

            // Assinatura baseada no ALVO, não no texto
            let signature: string;
            if (commentId !== null) {
              // Mesmo autor + tipo + mesmo comentário = notificação repetida
              signature = `${item.type}-${actor}-comment-${commentId}`;
            } else if (
              (item.type === 'like' || item.type === 'retweet') &&
              tweetId !== null
            ) {
              // Mesma curtida/retweet do mesmo autor no mesmo tweet
              signature = `${item.type}-${actor}-tweet-${tweetId}`;
            } else if (item.type === 'follow') {
              signature = `follow-${actor}`;
            } else {
              // Sem informação suficiente: não arrisca esconder nada
              signature = `id-${idKey}`;
            }

            if (seen.has(signature)) return;
            seen.add(signature);

            uniqueList.push(
              locallyReadIdsRef.current.has(idKey)
                ? { ...item, is_read: true }
                : item
            );
          });

          // A lista guardada no estado mantém is_read=false (as bolinhas
          // continuam visíveis enquanto o modal está aberto)
          setNotifications(uniqueList);

          // Marca tudo como lido no servidor, para o contador do menu
          // refletir o valor real no próximo polling
          if (dataList.some((n: Notification) => n.is_read === false)) {
            api.post('/notifications/').catch(() => {});
          }
        }
      } catch (err) {
        console.error('Erro ao buscar notificações:', err);
      } finally {
        if (isMounted) setLoading(false);
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

  const handleNotificationClick = (notif: Notification) => {
    locallyReadIdsRef.current.add(String(notif.id));

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notif.id ? { ...item, is_read: true } : item
      )
    );

    // Marca como lida no backend sem bloquear a navegação
    api
      .post(`/notifications/${notif.id}/read/`)
      .catch(() =>
        api
          .patch(`/notifications/${notif.id}/`, { is_read: true })
          .catch(() => {})
      );

    const targetTweetId = notif.tweet_id ?? notif.tweet ?? null;
    const actorUsername = notif.user?.username || notif.actor?.username;

    // ID do comentário exato:
    // - 'comment': comentário novo (comment_id / comment / object_id)
    // - 'like'/'retweet': só se o backend mandar um comment explícito
    //   (object_id/target_id nesses casos costuma ser o ID do tweet)
    let targetCommentId: string | number | null = null;
    if (notif.type === 'comment') {
      targetCommentId =
        notif.comment_id ?? notif.comment ?? notif.object_id ?? null;
    } else if (notif.type === 'like' || notif.type === 'retweet') {
      targetCommentId = notif.comment_id ?? notif.comment ?? null;
    }

    onClose();

    if (notif.type === 'follow' && actorUsername && !targetTweetId) {
      navigate(`/profile/${actorUsername}`);
      return;
    }

    if (targetTweetId) {
      if (notif.type === 'comment' || targetCommentId) {
        clickCounterRef.current += 1;
        navigate(`/status/${targetTweetId}`, {
          state: {
            fromNotification: true,
            openComments: true,
            highlightCommentId: targetCommentId ?? undefined,
            // Muda a cada clique: permite rolar de novo para o mesmo comentário
            notifKey: clickCounterRef.current,
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
              const isComment =
                notif.type === 'comment' || notif.comment_id != null;

              return (
                <NotificationItem
                  key={notif.id ?? index}
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
