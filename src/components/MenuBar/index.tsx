import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Button';
import TweetModal from '../TweetModal';
import NotificationsModal from '../NotificationsModal';
import { api } from '../../services/api';

import {
  Container,
  Topside,
  Logo,
  MenuButton,
  HomeIcon,
  BellIcon,
  EmailIcon,
  FavoriteIcon,
  ProfileIcon,
  SettingsIcon,
  Botside,
  Avatar,
  ProfileData,
  ExitIcon,
  IconWrapper,
  NotificationBadge,
} from './styles';

const MenuBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams<{ username?: string }>();

  const { user: authUser, signOut } = useAuth();

  const [isTweetModalOpen, setIsTweetModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] =
    useState(false);

  const [unreadPostsCount, setUnreadPostsCount] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  const prevNotificationsRef = useRef<number>(0);
  const prevMessagesRef = useRef<number>(0);

  const isHome = location.pathname === '/';
  const isMyProfile =
    location.pathname === '/profile' || username === authUser?.username;
  const isFavorites = location.pathname === '/favorites';
  const isMessages = location.pathname.startsWith('/messages');
  const isSettings = location.pathname === '/settings';

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Escuta o evento disparado pela SideBar para abrir o modal de notificações
  useEffect(() => {
    const handleOpenNotificationsEvent = () => {
      setIsNotificationsModalOpen(true);
      setUnreadCount(0);
    };

    window.addEventListener(
      'open-notifications-modal',
      handleOpenNotificationsEvent
    );

    return () => {
      window.removeEventListener(
        'open-notifications-modal',
        handleOpenNotificationsEvent
      );
    };
  }, []);

  useEffect(() => {
    if (!authUser) return;

    const fetchCounts = async () => {
      try {
        const response = await api.get('/tweets/unread_count/');
        const data = response.data;
        const count =
          Number(
            typeof data === 'number'
              ? data
              : (data?.unread_count ?? data?.count ?? data?.unread ?? 0)
          ) || 0;

        setUnreadPostsCount(count);
      } catch {
        setUnreadPostsCount(0);
      }

      try {
        const response = await api.get('/notifications/unread_count/');
        const data = response.data;
        const count =
          Number(
            typeof data === 'number'
              ? data
              : (data?.unread_count ?? data?.count ?? data?.unread ?? 0)
          ) || 0;

        if (
          count > prevNotificationsRef.current &&
          Notification.permission === 'granted'
        ) {
          new Notification('Twitter Clone', {
            body: 'Tens novas notificações e interações!',
            icon: '/favicon.ico',
          });
        }

        prevNotificationsRef.current = count;
        setUnreadCount(count);
      } catch (error) {
        console.error('Erro ao buscar contador de notificações:', error);
      }

      try {
        const response = await api.get('/messages/unread_count/');
        const data = response.data;
        const count =
          Number(
            typeof data === 'number'
              ? data
              : (data?.unread_count ?? data?.count ?? data?.unread ?? 0)
          ) || 0;

        if (
          count > prevMessagesRef.current &&
          Notification.permission === 'granted'
        ) {
          new Notification('Nova Mensagem Direta', {
            body: 'Recebeste uma nova mensagem!',
            icon: '/favicon.ico',
          });
        }

        prevMessagesRef.current = count;
        setUnreadMessagesCount(count);
      } catch (error) {
        console.error('Erro ao buscar contador de mensagens não lidas:', error);
      }
    };

    fetchCounts();
    const intervalId = setInterval(fetchCounts, 5000);

    return () => clearInterval(intervalId);
  }, [authUser]);

  const handleOpenNotifications = () => {
    setIsNotificationsModalOpen(true);
    setUnreadCount(0);
  };

  const handleNavigate = (path: string) => {
    setIsNotificationsModalOpen(false);

    if (path === '/') {
      setUnreadPostsCount(0);
    } else if (path === '/messages') {
      setUnreadMessagesCount(0);
    }

    navigate(path);
  };

  const handleLogout = () => {
    if (signOut) {
      signOut();
    } else {
      localStorage.removeItem('token');
      navigate('/auth');
    }
  };

  return (
    <Container>
      <Topside>
        <Logo />

        <MenuButton
          className={isHome && !isNotificationsModalOpen ? 'active' : ''}
          onClick={() => handleNavigate('/')}
        >
          <IconWrapper>
            <HomeIcon />
            {unreadPostsCount > 0 && !isHome && (
              <NotificationBadge>
                {unreadPostsCount > 99 ? '99+' : unreadPostsCount}
              </NotificationBadge>
            )}
          </IconWrapper>
          <span>Página Inicial</span>
        </MenuButton>

        <MenuButton
          className={isNotificationsModalOpen ? 'active' : ''}
          onClick={handleOpenNotifications}
        >
          <IconWrapper>
            <BellIcon />
            {unreadCount > 0 && (
              <NotificationBadge>
                {unreadCount > 99 ? '99+' : unreadCount}
              </NotificationBadge>
            )}
          </IconWrapper>
          <span>Notificações</span>
        </MenuButton>

        <MenuButton
          className={isMessages && !isNotificationsModalOpen ? 'active' : ''}
          onClick={() => handleNavigate('/messages')}
        >
          <IconWrapper>
            <EmailIcon />
            {unreadMessagesCount > 0 && (
              <NotificationBadge>
                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
              </NotificationBadge>
            )}
          </IconWrapper>
          <span>Mensagens</span>
        </MenuButton>

        <MenuButton
          className={isFavorites && !isNotificationsModalOpen ? 'active' : ''}
          onClick={() => handleNavigate('/favorites')}
        >
          <FavoriteIcon />
          <span>Favoritos</span>
        </MenuButton>

        <MenuButton
          className={isMyProfile && !isNotificationsModalOpen ? 'active' : ''}
          onClick={() => handleNavigate('/profile')}
        >
          <ProfileIcon />
          <span>Perfil</span>
        </MenuButton>

        <MenuButton
          className={isSettings && !isNotificationsModalOpen ? 'active' : ''}
          onClick={() => handleNavigate('/settings')}
        >
          <SettingsIcon />
          <span>Configurações</span>
        </MenuButton>

        <Button onClick={() => setIsTweetModalOpen(true)}>
          <span>Tweetar</span>
        </Button>
      </Topside>

      <Botside
        onClick={handleLogout}
        style={{ cursor: 'pointer' }}
        title="Terminar sessão"
      >
        <Avatar
          style={
            authUser?.profile?.avatar
              ? {
                  backgroundImage: `url(${authUser.profile.avatar})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        />
        <ProfileData>
          <strong>
            {authUser?.first_name || authUser?.username || 'Utilizador'}
          </strong>
          <span>@{authUser?.username || 'utilizador'}</span>
        </ProfileData>

        <ExitIcon onClick={handleLogout} />
      </Botside>

      <TweetModal
        isOpen={isTweetModalOpen}
        onClose={() => setIsTweetModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />
    </Container>
  );
};

export default MenuBar;
