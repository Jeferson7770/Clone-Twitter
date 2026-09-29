import React, { useEffect, useState } from 'react';
import StickyBox from 'react-sticky-box';

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

const SideBar: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [suggestions, setSuggestions] = useState<IUserSuggestion[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [newsList, setNewsList] = useState<INewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState<boolean>(true);

  //  Procurar Notícias
  useEffect(() => {
    const fetchRealNews = async () => {
      try {
        const response = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss?hl=pt-BR%26gl=BR%26ceid=BR:pt-419'
        );
        const data = await response.json();

        if (data.status === 'ok' && data.items) {
          const formattedNews = data.items
            .slice(0, 5)
            .map((item: IRssNewsItem, index: number) => {
              const titleParts = item.title.split(' - ');
              const source = titleParts.pop() || 'Notícias';
              const cleanTitle = titleParts.join(' - ') || item.title;

              return {
                id: index,
                category: `${source} · Assunto do Momento`,
                title: cleanTitle,
                url: item.link,
              };
            });

          setNewsList(formattedNews);
        }
      } catch (error) {
        console.error('Erro ao carregar notícias em tempo real:', error);
        setNewsList([
          {
            id: 1,
            category: 'Tecnologia · Assunto do Momento',
            title: 'Inteligência Artificial e Inovação',
            url: 'https://g1.globo.com/tecnologia/',
          },
          {
            id: 2,
            category: 'Esportes · Assunto do Momento',
            title: 'Futebol Brasileiro e Campeonatos',
            url: 'https://ge.globo.com/',
          },
        ]);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchRealNews();
  }, []);

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
        console.error('Erro ao carregar sugestões de seguimento:', error);
      });

    const fetchUnreadNotifications = async () => {
      try {
        const response = await api.get('/notifications/unread_count/');
        setUnreadCount(response.data.unread_count);
      } catch (error) {
        console.error('Erro ao buscar contador de notificações:', error);
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
    if (searchTerm === '') return true;

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
      <SearchWrapper>
        <SearchInput
          placeholder="Buscar no Twitter"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon />
      </SearchWrapper>

      <StickyBox offsetTop={20} offsetBottom={20}>
        <Body>
          {unreadCount > 0 && (
            <div
              style={{
                padding: '10px 15px',
                color: '#1da1f2',
                fontWeight: 'bold',
              }}
            >
              🔔 Tens {unreadCount} nova(s) notificação!
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
                      Carregando sugestões...
                    </span>,
                  ]
            }
          />

          <List
            title="O que está acontecendo"
            elements={
              loadingNews
                ? [
                    <span
                      key="loading-news"
                      style={{
                        padding: '10px 15px',
                        color: 'var(--gray)',
                        fontSize: '14px',
                      }}
                    >
                      Carregando notícias...
                    </span>,
                  ]
                : newsList.map((news) => (
                    <News
                      key={news.id}
                      category={news.category}
                      title={news.title}
                      url={news.url}
                    />
                  ))
            }
          />
        </Body>
      </StickyBox>
    </Container>
  );
};

export default SideBar;
