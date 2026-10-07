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
  HashtagDropdown,
  HashtagItem,
  StatusMessage,
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
  usos_recentes?: number;
  score_tendencia?: number;
}

const SideBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [suggestions, setSuggestions] = useState<IUserSuggestion[]>([]);

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
        const cleanTerm = searchTerm.replace(/^#+/, '').trim();
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
      <SearchWrapper>
        <SearchInput
          placeholder="Buscar no Twitter"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchTerm.trim() !== '') {
              if (searchTerm.startsWith('#')) {
                const cleanTerm = searchTerm.replace(/^#+/, '').trim();
                navigate(`/hashtag/${cleanTerm}`);
              } else {
                navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
              }
              setSearchTerm('');
            }
          }}
        />
        <SearchIcon />

        {searchTerm.startsWith('#') && hashtagResults.length > 0 && (
          <HashtagDropdown>
            {hashtagResults.map((tag, index) => {
              const cleanTagName = tag.nome.replace(/^#+/, '');
              return (
                <HashtagItem
                  key={index}
                  onClick={() => {
                    navigate(`/hashtag/${cleanTagName}`);
                    setSearchTerm('');
                  }}
                >
                  #{cleanTagName}
                </HashtagItem>
              );
            })}
          </HashtagDropdown>
        )}
      </SearchWrapper>

      <StickyBox offsetTop={20} offsetBottom={20}>
        <Body>
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
                      <StatusMessage key="not-found">
                        Nenhum utilizador encontrado.
                      </StatusMessage>,
                    ]
                : [
                    <StatusMessage key="loading">
                      A carregar sugestões...
                    </StatusMessage>,
                  ]
            }
          />

          <List
            title="O que está acontecendo"
            elements={
              loadingContent
                ? [
                    <StatusMessage key="loading-news">
                      A carregar...
                    </StatusMessage>,
                  ]
                : [
                    ...trending.map((item, index) => {
                      const cleanTagName = item.nome.replace(/^#+/, '');
                      return (
                        <News
                          key={`trend-${index}`}
                          category="Tendência na sua rede"
                          title={`#${cleanTagName}`}
                          onClick={() => navigate(`/hashtag/${cleanTagName}`)}
                        />
                      );
                    }),
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
