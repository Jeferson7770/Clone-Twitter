import React, { useEffect, useState } from 'react';
import StickyBox from 'react-sticky-box';
import { useNavigate } from 'react-router-dom';

import List from '../List';
import FollowSuggestion from '../FollowSuggestion';
import News from '../News';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

import {
  Container,
  SearchWrapper,
  SearchInput,
  SearchIcon,
  Body,
} from './styles';

interface IUserSuggestion {
  id: number | string;
  first_name: string;
  username: string;
  profile?: {
    avatar?: string;
  };
  is_following?: boolean;
}

interface INewsItem {
  id: string | number;
  category: string;
  title: string;
  url: string;
}

interface IRssNewsItem {
  title: string;
  link: string;
}

interface ITrendingHashtag {
  nome: string;
  usos_recentes: number;
  score_tendencia: number;
}

const SideBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [suggestions, setSuggestions] = useState<IUserSuggestion[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [hashtagResults, setHashtagResults] = useState<{ nome: string }[]>([]);

  const [trending, setTrending] = useState<ITrendingHashtag[]>([]);
  const [newsList, setNewsList] = useState<INewsItem[]>([]);
  const [loadingContent, setLoadingContent] = useState<boolean>(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoadingContent(true);

      try {
        const trendsResponse = await api.get('/hashtags/trending/');
        setTrending(trendsResponse.data);
      } catch (error) {
        console.error('Erro ao carregar trending hashtags:', error);
      }

      try {
        const newsResponse = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss?hl=pt-BR%26gl=BR%26ceid=BR:pt-419'
        );
        const data = await newsResponse.json();

        if (data.status === 'ok' && data.items) {
          const formattedNews = data.items
            .slice(0, 5)
            .map((item: IRssNewsItem, index: number) => {
              const titleParts = item.title.split(' - ');
              const source = titleParts.pop() || 'Notícias';
              const cleanTitle = titleParts.join(' - ') || item.title;

              return {
                id: `news-${index}`,
                category: `${source} · Assunto do Momento`,
                title: cleanTitle,
                url: item.link,
              };
            });
          setNewsList(formattedNews);
        }
      } catch (error) {
        console.error('Erro ao carregar notícias:', error);
      } finally {
        setLoadingContent(false);
      }
    };

    fetchContent();
    const intervalId = setInterval(fetchContent, 300000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.startsWith('#')) {
        const cleanTerm = searchTerm.replace('#', '').trim();
        if (cleanTerm.length > 0) {
          try {
            const response = await api.get(
              `/hashtags/autocomplete/?q=${cleanTerm}`
            );
            setHashtagResults(response.data);
          } catch (error) {
            console.error('Erro na pesquisa de hashtags:', error);
          }
        }
      } else {
        setHashtagResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    api
      .get('/users/')
      .then((response) => {
        const filteredUsers = response.data.filter(
          (suggestion: IUserSuggestion) =>
            suggestion.username !== user?.username
        );
        setSuggestions(filteredUsers);
      })
      .catch((error) => {
        console.error('Erro ao carregar sugestões:', error);
      });

    const fetchUnreadNotifications = async () => {
      try {
        const response = await api.get('/notifications/unread_count/');
        setUnreadCount(response.data.unread_count);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
      }
    };

    fetchUnreadNotifications();
    const intervalId = setInterval(fetchUnreadNotifications, 10000);

    return () => clearInterval(intervalId);
  }, [user]);

  const handleFollowChange = (delta: number) => {
    if (user && updateUser) {
      updateUser({
        ...user,
        following_count: Math.max(0, (user.following_count || 0) + delta),
      });
    }
  };

  const filteredSuggestions = suggestions.filter((suggestion) => {
    if (searchTerm === '' || searchTerm.startsWith('#')) return true;

    const lowerCaseSearch = searchTerm.toLowerCase();
    const matchUsername = suggestion.username
      .toLowerCase()
      .includes(lowerCaseSearch);
    const matchName = suggestion.first_name
      ?.toLowerCase()
      .includes(lowerCaseSearch);

    return matchUsername || matchName;
  });

  return (
    <Container>
      <SearchWrapper style={{ position: 'relative' }}>
        <SearchInput
          placeholder="Buscar no Twitter"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchTerm.trim() !== '') {
              if (searchTerm.startsWith('#')) {
                const cleanTerm = searchTerm.replace('#', '').trim();
                navigate(`/hashtag/${cleanTerm}`);
              } else {
                navigate(`/search?q=${searchTerm.trim()}`);
              }
              setSearchTerm('');
            }
          }}
        />
        <SearchIcon />

        {searchTerm.startsWith('#') && hashtagResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '45px',
              left: 0,
              right: 0,
              backgroundColor: 'var(--primary)',
              border: '1px solid var(--outline)',
              borderRadius: '8px',
              zIndex: 10,
              overflow: 'hidden',
            }}
          >
            {hashtagResults.map((tag, index) => (
              <div
                key={index}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--outline)',
                  color: 'var(--twitter)',
                  fontWeight: 'bold',
                }}
                onClick={() => {
                  navigate(`/hashtag/${tag.nome}`);
                  setSearchTerm('');
                }}
              >
                #{tag.nome}
              </div>
            ))}
          </div>
        )}
      </SearchWrapper>

      <StickyBox offsetTop={20} offsetBottom={20}>
        <Body>
          {unreadCount > 0 && (
            <div
              onClick={() => navigate('/notifications')}
              style={{
                padding: '10px 15px',
                color: '#1da1f2',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              🔔 Tens {unreadCount} nova{unreadCount > 1 ? 's' : ''} notificaç
              {unreadCount > 1 ? 'ões' : 'ão'}!
            </div>
          )}

          <List
            title="Talvez você curta"
            elements={
              suggestions.length > 0
                ? filteredSuggestions.length > 0
                  ? filteredSuggestions
                      .slice(0, 6)
                      .map((suggestionUser) => (
                        <FollowSuggestion
                          key={suggestionUser.id}
                          id={suggestionUser.id}
                          name={
                            suggestionUser.first_name || suggestionUser.username
                          }
                          nickname={`@${suggestionUser.username}`}
                          avatar={suggestionUser.profile?.avatar}
                          initialIsFollowing={suggestionUser.is_following}
                          onFollowChange={handleFollowChange}
                        />
                      ))
                  : [
                      <span
                        key="not-found"
                        style={{
                          padding: '10px 15px',
                          color: 'var(--gray)',
                          fontSize: '14px',
                        }}
                      >
                        Nenhum utilizador encontrado.
                      </span>,
                    ]
                : [
                    <span
                      key="loading"
                      style={{
                        padding: '10px 15px',
                        color: 'var(--gray)',
                        fontSize: '14px',
                      }}
                    >
                      A carregar sugestões...
                    </span>,
                  ]
            }
          />

          <List
            title="O que está acontecendo"
            elements={
              loadingContent
                ? [
                    <span
                      key="loading-news"
                      style={{
                        padding: '10px 15px',
                        color: 'var(--gray)',
                        fontSize: '14px',
                      }}
                    >
                      A carregar...
                    </span>,
                  ]
                : [
                    ...trending.map((item, index) => (
                      <News
                        key={`trend-${index}`}
                        category="Tendência na sua rede"
                        title={`#${item.nome}`}
                        url={`/hashtag/${item.nome}`}
                      />
                    )),
                    ...newsList.map((news) => (
                      <News
                        key={news.id}
                        category={news.category}
                        title={news.title}
                        url={news.url}
                      />
                    )),
                  ]
            }
          />
        </Body>
      </StickyBox>
    </Container>
  );
};

export default SideBar;
