import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Tweet, { type ITweetData } from '../Tweet';
import { Container, Tab, Tweets, Message } from './styles';

interface FeedProps {
  username?: string;
}

const Feed: React.FC<FeedProps> = ({ username }) => {
  const [tweets, setTweets] = useState<ITweetData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const endpoint = username
          ? `/tweets/?username=${username}`
          : '/tweets/';

        const response = await api.get(endpoint);
        setTweets(response.data);
      } catch (error) {
        console.error('Erro ao buscar tweets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, [username]);

  const handleDeleteTweet = (tweetId: number | string) => {
    setTweets((prevTweets) => prevTweets.filter((t) => t.id !== tweetId));
  };

  return (
    <Container>

      {!username && <Tab>Página Inicial</Tab>}

      <Tweets>
        {loading ? (
          <Message>Carregando tweets...</Message>
        ) : tweets.length > 0 ? (
          tweets.map((tweet, index) => (
            <Tweet
              key={`${tweet.id}-${index}`}
              tweet={tweet}
              onDelete={handleDeleteTweet}
            />
          ))
        ) : (
          <Message>Nenhum tweet no momento.</Message>
        )}
      </Tweets>
    </Container>
  );
};

export default Feed;
