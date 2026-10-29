import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

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
    // location.key === 'default' significa que a página foi aberta diretamente
    // (link ou F5), sem histórico interno: voltar sairia da aplicação.
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Depois de apagar, a publicação deixa de existir: sai desta página
  const handleDeleted = () => {
    setTweet(null);
    handleBack();
  };

  if (loading) {
    return (
      <MessageContainer $center>
        <p>Carregando publicação...</p>
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

      <Tweet tweet={tweet} onDelete={handleDeleted} />
    </Container>
  );
};

export default TweetPage;
