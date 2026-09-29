import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ProfilePage from '../ProfilePage';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
  Container,
  Header,
  BackIcon,
  ProfileInfo,
  BottomMenu,
  HomeIcon,
  SearchIcon,
  BellIcon,
  EmailIcon,
} from './styles';

export interface UserData {
  username: string;
  first_name?: string;
  tweets_count?: number;
}

const Main: React.FC = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams<{ username?: string }>();

  const isProfilePage = location.pathname.includes('/profile');

  const [profileUser, setProfileUser] = useState<UserData | null>(null);

  const isMyProfile = !username || username === authUser?.username;
  const displayUser = isMyProfile ? authUser : profileUser;

  useEffect(() => {
    async function fetchHeaderUser() {
      if (isMyProfile) {
        setProfileUser(null);
        return;
      }
      try {
        const response = await api.get(`/users/${username}/`);
        setProfileUser(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados do cabeçalho', error);
      }
    }
    fetchHeaderUser();
  }, [username, isMyProfile]);

  const displayName =
    displayUser?.first_name || displayUser?.username || 'Usuário';

  const tweetsCount = displayUser?.tweets_count ?? 0;

  return (
    <Container>
      <Header>
        <button onClick={() => (isProfilePage ? navigate(-1) : navigate('/'))}>
          <BackIcon />
        </button>
        <ProfileInfo>
          <strong>
            {isProfilePage
              ? displayName
              : authUser?.first_name || authUser?.username || 'Página Inicial'}
          </strong>
          <span>
            {isProfilePage ? `${tweetsCount} Tweets` : 'Atualizações'}
          </span>
        </ProfileInfo>
      </Header>

      <ProfilePage />

      <BottomMenu>
        <HomeIcon
          className="active"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />
        <SearchIcon />
        <BellIcon />
        <EmailIcon />
      </BottomMenu>
    </Container>
  );
};

export default Main;
