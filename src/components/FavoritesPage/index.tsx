import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Tweet, { type ITweetData } from '../Tweet';

import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const FavoritesPage: React.FC = () => {
  const [tweets, setTweets] = useState<ITweetData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLikedTweets = async () => {
      if (!user?.username) return;

      try {
        setLoading(true);
        const response = await api.get(`/users/${user.username}/favorites/`);
        setTweets(response.data);
      } catch (error) {
        console.error('Erro ao buscar tweets favoritados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedTweets();
  }, [user?.username]);

  return (
    <Container>
      {loading ? (
        <p
          style={{ textAlign: 'center', padding: '20px', color: 'var(--gray)' }}
        >
          A carregar favoritos...
        </p>
      ) : tweets.length > 0 ? (
        tweets.map((tweet, index) => (
          <Tweet key={`${tweet.id}-${index}`} tweet={tweet} />
        ))
      ) : (
        <p
          style={{ textAlign: 'center', padding: '40px', color: 'var(--gray)' }}
        >
          Ainda não favoritaste nenhum tweet.
        </p>
      )}
    </Container>
  );
};

export default FavoritesPage;
