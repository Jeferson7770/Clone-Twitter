import { useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import type { ILikedUser, ITweetData } from '../types';
import { prependUserIfMissing, toLikedUser } from '../utils';
import { useFollowToggle } from './useFollowToggle';

interface Options {
  tweet: ITweetData;
  onUpdate?: () => void;
  closeMenu: () => void;
}

/**
 * Tudo sobre retweet: retweet simples, retweet com comentário (quote)
 * e o modal "Retuitado por".
 */
export function useRetweet({ tweet, onUpdate, closeMenu }: Options) {
  const { user } = useAuth();

  const [retweetsCount, setRetweetsCount] = useState(tweet.retweets_count || 0);
  const [isRetweeted, setIsRetweeted] = useState(tweet.is_retweeted || false);
  const [hasQuoted, setHasQuoted] = useState(tweet.has_quoted || false); // <-- Adicionado estado de quote

  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [loadingQuote, setLoadingQuote] = useState(false);

  const [isRetweetedByOpen, setIsRetweetedByOpen] = useState(false);
  const [retweetedByUsers, setRetweetedByUsers] = useState<ILikedUser[]>([]);
  const [loadingRetweetedBy, setLoadingRetweetedBy] = useState(false);

  const toggleFollow = useFollowToggle(setRetweetedByUsers);

  const handleStandardRetweet = async (e: MouseEvent) => {
    e.stopPropagation();
    closeMenu();
    try {
      const response = await api.post(`tweets/${tweet.id}/retweet/`);
      if (response.status === 200 || response.status === 201) {
        const nextIsRetweeted = !isRetweeted;
        setIsRetweeted(nextIsRetweeted);
        setRetweetsCount((prev) => (isRetweeted ? prev - 1 : prev + 1));

        if (user) {
          setRetweetedByUsers((prev) =>
            nextIsRetweeted
              ? prependUserIfMissing(prev, user)
              : prev.filter((u) => u.username !== user.username)
          );
        }
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao retuitar:', error);
    }
  };

  const openQuote = (e: MouseEvent) => {
    e.stopPropagation();
    closeMenu();
    setIsQuoteOpen(true);
  };

  const closeQuote = () => setIsQuoteOpen(false);

  const submitQuote = async (e: FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim()) return;
    setLoadingQuote(true);
    try {
      await api.post(`tweets/${tweet.id}/quote/`, {
        content: quoteText.trim(),
      });

      setRetweetsCount((prev) => prev + 1);
      setHasQuoted(true); // <-- Marca como citado para bloquear novas ações de retweet/quote

      if (user) {
        setRetweetedByUsers((prev) => prependUserIfMissing(prev, user));
      }

      setIsQuoteOpen(false);
      setQuoteText('');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao comentar no retweet:', error);
    } finally {
      setLoadingQuote(false);
    }
  };

  const openRetweetedBy = async (e: MouseEvent) => {
    e.stopPropagation();
    setIsRetweetedByOpen(true);
    setLoadingRetweetedBy(true);
    try {
      const response = await api.get(`tweets/${tweet.id}/retweeted_by/`);
      let fetchedUsers: ILikedUser[] = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      if (isRetweeted && user) {
        fetchedUsers = prependUserIfMissing(fetchedUsers, user);
      }

      setRetweetedByUsers(fetchedUsers);
    } catch (error) {
      console.error('Erro ao buscar lista de quem retuitou:', error);
      if (isRetweeted && user) {
        setRetweetedByUsers([toLikedUser(user)]);
      }
    } finally {
      setLoadingRetweetedBy(false);
    }
  };

  const closeRetweetedBy = () => setIsRetweetedByOpen(false);

  return {
    retweetsCount,
    isRetweeted,
    hasQuoted, // <-- Expor a propriedade no retorno do hook
    handleStandardRetweet,
    quote: {
      isOpen: isQuoteOpen,
      text: quoteText,
      setText: setQuoteText,
      loading: loadingQuote,
      open: openQuote,
      close: closeQuote,
      submit: submitQuote,
    },
    retweetedBy: {
      isOpen: isRetweetedByOpen,
      users: retweetedByUsers,
      loading: loadingRetweetedBy,
      open: openRetweetedBy,
      close: closeRetweetedBy,
      toggleFollow,
    },
  };
}
