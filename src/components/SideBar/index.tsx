import React, { useEffect, useState, useCallback } from 'react';
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

interface IIbgeNewsItem {
  id: number;
  titulo: string;
  link: string;
  editorias?: string;
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
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [hashtagResults, setHashtagResults] = useState<{ nome: string }[]>([]);

  const [trending, setTrending] = useState<ITrendingHashtag[]>([]);
  const [loadingTrending, setLoadingTrending] = useState<boolean>(true);

  const [newsList, setNewsList] = useState<INewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      try {
        // ✅ Corrigido: usando a rota do proxy configurada no vite.config.ts para evitar CORS
        const response = await fetch('/api-ibge/api/3/noticias/?qtd=4');
        const data = await response.json();

        if (isMounted && data && data.items) {
          const formattedNews = data.items.map(
            (item: IIbgeNewsItem, index: number) => {
              const editoria = item.editorias
                ? item.editorias.split(';')[0]
                : 'Brasil';
              return {
                id: `news-${item.id || index}`,
                category: `${editoria} · Assunto do Momento`,
                title: item.titulo,
                url: item.link,
              };
            }
          );
          setNewsList(formattedNews);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Erro ao buscar notícias, usando fallback:', error);
          setNewsList([
            {
              id: 'fallback-1',
              category: 'Política · G1',
              title: 'Novas diretrizes econômicas são debatidas no Congresso',
              url: 'https://g1.globo.com',
            },
            {
              id: 'fallback-2',
              category: 'Tecnologia · CNN Brasil',
              title: 'Avanços da inteligência artificial transformam o mercado',
              url: 'https://www.cnnbrasil.com.br',
            },
            {
              id: 'fallback-3',
              category: 'Mundo · Valor Econômico',
              title: 'Bolsas internacionais reagerem a novos índices globais',
              url: 'https://valor.globo.com',
            },
          ]);
        }
      } finally {
        if (isMounted) setLoadingNews(false);
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchTrending = useCallback(async () => {
    try {
      const response = await api.get('/hashtags/trending/');
      setTrending(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar trending hashtags:', error);
      setTrending([]);
    } finally {
      setLoadingTrending(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadTrendingAsync = async () => {
      if (isMounted) {
        await fetchTrending();
      }
    };

    loadTrendingAsync();
    const intervalId = setInterval(fetchTrending, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fetchTrending]);

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
    let isMounted = true;

    api
      .get('/users/')
      .then((response) => {
        if (isMounted) {
          const filteredUsers = response.data.filter(
            (suggestion: IUserSuggestion) =>
              suggestion.username !== user?.username
          );
          setSuggestions(filteredUsers);
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar sugestões:', error);
      })
      .finally(() => {
        if (isMounted) setLoadingSuggestions(false);
      });

    return () => {
      isMounted = false;
    };
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
              loadingSuggestions
                ? [
                    <StatusMessage key="loading">
                      Carregando sugestões...
                    </StatusMessage>,
                  ]
                : filteredSuggestions.length > 0
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
                        Nenhum usuário encontrado.
                      </StatusMessage>,
                    ]
            }
          />

          <List
            title="O que está acontecendo"
            elements={[
              ...(loadingTrending
                ? [
                    <StatusMessage key="loading-trend">
                      Atualizando tendências...
                    </StatusMessage>,
                  ]
                : trending.length > 0
                  ? trending.map((item, index) => {
                      const cleanTagName = item.nome.replace(/^#+/, '');
                      return (
                        <News
                          key={`trend-${index}`}
                          category="Tendência na sua rede"
                          title={`#${cleanTagName}`}
                          onClick={() => navigate(`/hashtag/${cleanTagName}`)}
                        />
                      );
                    })
                  : []),

              ...(loadingNews
                ? [
                    <StatusMessage key="loading-news">
                      Carregando notícias...
                    </StatusMessage>,
                  ]
                : newsList.map((news) => (
                    <News
                      key={news.id}
                      category={news.category}
                      title={news.title}
                      url={news.url}
                    />
                  ))),
            ]}
          />
        </Body>
      </StickyBox>
    </Container>
  );
};

export default SideBar;
