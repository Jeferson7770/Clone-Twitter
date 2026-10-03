import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Tweet, { type ITweetData } from '../Tweet';
import {
  Container,
  Tab,
  Tweets,
  Message,
  HeaderContainer,
  SortToggle,
} from './styles';

interface FeedProps {
  username?: string;
  hashtag?: string;
}

type SortOption = 'recent' | 'popular';

const Feed: React.FC<FeedProps> = ({ username, hashtag }) => {
  const [tweets, setTweets] = useState<ITweetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  useEffect(() => {
    const controller = new AbortController();

    const fetchTweets = async () => {
      setLoading(true);
      try {
        let endpoint = '/tweets/';
        const params = new URLSearchParams();

        if (username) {
          params.append('username', username);
        }

        if (hashtag) {
          const cleanHashtag = hashtag.replace(/^#/, '').toLowerCase();

          endpoint = `/hashtags/${cleanHashtag}/tweets/`;
        }

        if (sortBy === 'popular') {
          if (hashtag) {
            params.append('sort', 'relevant'); 
          } else {
            params.append('ordering', '-likes_count,-retweets_count');
          }
        }

        if (params.toString()) {
          endpoint += (endpoint.includes('?') ? '&' : '?') + params.toString();
        }

        const response = await api.get(endpoint, {
          signal: controller.signal,
        });

        const fetchedTweets: ITweetData[] = response.data.results
          ? response.data.results
          : response.data;

        const uniqueTweets = Array.from(
          new Map(fetchedTweets.map((tweet) => [tweet.id, tweet])).values()
        );

        setTweets(uniqueTweets);
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'CanceledError') {
          console.error('Erro ao buscar tweets:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();

    return () => controller.abort();
  }, [username, hashtag, sortBy]);

  const handleDeleteTweet = (tweetId: number | string) => {
    setTweets((prevTweets) => prevTweets.filter((t) => t.id !== tweetId));
  };

  const getTabTitle = () => {
    if (hashtag) return hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    if (username) return `Tweets de @${username}`;
    return 'Página Inicial';
  };

  return (
    <Container>
      <HeaderContainer>
        <Tab>{getTabTitle()}</Tab>

        {!username && (
          <SortToggle>
            <button
              className={sortBy === 'recent' ? 'active' : ''}
              onClick={() => setSortBy('recent')}
            >
              Mais recentes
            </button>
            <button
              className={sortBy === 'popular' ? 'active' : ''}
              onClick={() => setSortBy('popular')}
            >
              Em alta
            </button>
          </SortToggle>
        )}
      </HeaderContainer>

      <Tweets>
        {loading ? (
          <Message>A carregar...</Message>
        ) : tweets.length > 0 ? (
          tweets.map((tweet) => (
            <Tweet
              key={`tweet-${tweet.id}`}
              tweet={tweet}
              onDelete={handleDeleteTweet}
            />
          ))
        ) : (
          <Message>Nenhum tweet encontrado para esta hashtag.</Message>
        )}
      </Tweets>
    </Container>
  );
};

export default Feed;
