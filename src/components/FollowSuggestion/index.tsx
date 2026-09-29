import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

import { Container, Avatar, Info, FollowButton } from './styles';

interface Props {
  id: number | string;
  name: string;
  nickname: string;
  avatar?: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: number) => void; 
}

const FollowSuggestion: React.FC<Props> = ({
  name,
  nickname,
  avatar,
  initialIsFollowing = false,
  onFollowChange,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const cleanUsername = nickname.replace('@', '');

  const handleFollowClick = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/users/${cleanUsername}/follow/`);
        setIsFollowing(false);
        if (onFollowChange) onFollowChange(-1); 
      } else {
        await api.post(`/users/${cleanUsername}/follow/`);
        setIsFollowing(true);
        if (onFollowChange) onFollowChange(1); 
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown } };
      console.error(
        'Erro ao atualizar status de seguimento:',
        err.response?.data || error
      );
      alert('Não foi possível realizar esta ação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Link
        to={`/profile/${cleanUsername}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          flex: 1,
          textDecoration: 'none',
          color: 'inherit',
        }}
        title="Ver perfil"
      >
        <Avatar
          style={
            avatar
              ? {
                  backgroundImage: `url(${avatar})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        />
        <Info>
          <strong>{name}</strong>
          <span>{nickname}</span>
        </Info>
      </Link>

      <FollowButton
        $outlined={!isFollowing ? true : undefined}
        onClick={handleFollowClick}
        disabled={loading}
      >
        {isFollowing ? 'Seguindo' : 'Seguir'}
      </FollowButton>
    </Container>
  );
};

export default FollowSuggestion;
