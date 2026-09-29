import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

import Tweet, { type ITweetData } from '../Tweet';

import {
  Container,
  MessageContainer,
  BackButtonText,
  ErrorText,
  Header,
  HeaderBackButton,
  HeaderTitle,
} from './styles';

const TweetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tweet, setTweet] = useState<ITweetData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTweet = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/tweets/${id}/`);
        setTweet(response.data);
      } catch (err: unknown) {
        console.error('Erro ao buscar tweet:', err);
        setError(
          'Não foi possível carregar esta publicação. Ela pode ter sido apagada.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTweet();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <MessageContainer $center>
        <p>A carregar publicação...</p>
      </MessageContainer>
    );
  }

  if (error || !tweet) {
    return (
      <MessageContainer>
        <BackButtonText onClick={handleBack}>&larr; Voltar</BackButtonText>
        <ErrorText>{error || 'Publicação não encontrada.'}</ErrorText>
      </MessageContainer>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderBackButton onClick={handleBack}>&larr;</HeaderBackButton>
        <HeaderTitle>Publicação</HeaderTitle>
      </Header>

      <Tweet tweet={tweet} />
    </Container>
  );
};

export default TweetPage;
