import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Tweet, { type ITweetData } from '../Tweet';

import { Container, LoadingMessage, EmptyMessage } from './styles';

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
        <LoadingMessage>Carregando favoritos...</LoadingMessage>
      ) : tweets.length > 0 ? (
        tweets.map((tweet, index) => (
          <Tweet key={`${tweet.id}-${index}`} tweet={tweet} />
        ))
      ) : (
        <EmptyMessage>Você ainda não favoritou nenhum tweet.</EmptyMessage>
      )}
    </Container>
  );
};

export default FavoritesPage;
