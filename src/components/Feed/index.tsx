import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import Tweet, { type ITweetData } from '../Tweet';
import { useAuth } from '../../contexts/AuthContext';

import {
  Container,
  Tab,
  Tweets,
  Message,
  HeaderContainer,
  SortToggle,
  TweetBoxContainer,
  Avatar,
  InputContainer,
  TweetInput,
  ActionArea,
  IconsContainer,
  PostButton,
  ImagePreviewContainer,
  PreviewImage,
  RemoveImageButton,
  EmojiPickerPopover,
} from './styles';

interface FeedProps {
  username?: string;
  hashtag?: string;
}

type SortOption = 'recent' | 'popular';

const EMOJI_LIST = [
  '😊',
  '😂',
  '🔥',
  '🚀',
  '❤️',
  '👍',
  '🎉',
  '💡',
  '😎',
  '✨',
  '👏',
  '🙌',
];

const Feed: React.FC<FeedProps> = ({ username, hashtag }) => {
  const { user } = useAuth();
  const [tweets, setTweets] = useState<ITweetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const [newTweetContent, setNewTweetContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTweets = async () => {
      setLoading(true);
      try {
        let endpoint = '/tweets/';
        const params = new URLSearchParams();

        if (username) {
          params.append('username', username);
        } else if (hashtag) {
          const cleanHashtag = hashtag.replace(/^#/, '').toLowerCase();
          endpoint = `/hashtags/${cleanHashtag}/tweets/`;

          if (sortBy === 'popular') {
            params.append('sort', 'relevant');
          }
        } else if (sortBy === 'popular') {
          endpoint = '/tweets/em_alta/';
        }

        if (params.toString()) {
          endpoint += (endpoint.includes('?') ? '&' : '?') + params.toString();
        }

        const response = await api.get(endpoint, {
          signal: controller.signal,
        });

        const retrievedData = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        const uniqueTweets = Array.from(
          new Map(
            retrievedData.map((tweet: ITweetData) => {
              const t = tweet as ITweetData & { unique_id?: string };
              const identifier = t.unique_id || `tw_${tweet.id}`;
              return [identifier, { ...t, unique_id: identifier }];
            })
          ).values()
        ) as ITweetData[];

        setTweets(uniqueTweets);
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'CanceledError') {
          console.error('Erro ao buscar tweets:', error);
          setTweets([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();

    return () => controller.abort();
  }, [username, hashtag, sortBy]);

  // CORREÇÃO: Remove o tweet correspondente ao ID ou unique_id em tempo real
  const handleDeleteTweet = (deletedId: string | number) => {
    setTweets((prevTweets) =>
      prevTweets.filter((t) => {
        const tweetWithId = t as ITweetData & { unique_id?: string };
        return (
          tweetWithId.unique_id !== deletedId &&
          t.id !== deletedId &&
          `tw_${t.id}` !== deletedId
        );
      })
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setNewTweetContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleCreateTweet = async () => {
    if (!newTweetContent.trim() && !selectedImage) return;

    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', newTweetContent);

      if (selectedImage) {
        formData.append('media', selectedImage);
      }

      const response = await api.post('/tweets/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newTweet = response.data as ITweetData & { unique_id?: string };
      if (!newTweet.unique_id) {
        newTweet.unique_id = `tw_${newTweet.id}`;
      }

      setTweets((prevTweets) => [newTweet, ...prevTweets]);
      setNewTweetContent('');
      handleRemoveImage();
    } catch (error) {
      console.error('Erro ao criar tweet:', error);
      alert('Não foi possível publicar o tweet. Tente novamente.');
    } finally {
      setIsPosting(false);
    }
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

      {!username && !hashtag && (
        <TweetBoxContainer>
          <Avatar
            src={
              user?.profile?.avatar ||
              'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
            }
            alt={user?.first_name || 'Utilizador'}
          />
          <InputContainer>
            <TweetInput
              placeholder="O que está a acontecer?"
              value={newTweetContent}
              onChange={(e) => setNewTweetContent(e.target.value)}
              rows={
                newTweetContent.split('\n').length > 1
                  ? newTweetContent.split('\n').length
                  : 1
              }
            />

            {imagePreviewUrl && (
              <ImagePreviewContainer>
                <PreviewImage src={imagePreviewUrl} alt="Pré-visualização" />
                <RemoveImageButton onClick={handleRemoveImage}>
                  ×
                </RemoveImageButton>
              </ImagePreviewContainer>
            )}

            <ActionArea>
              <IconsContainer>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleImageChange}
                />

                <svg
                  viewBox="0 0 24 24"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  <title>Adicionar imagem</title>
                  <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C1.881 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z" />
                </svg>

                <div style={{ position: 'relative' }}>
                  <svg
                    viewBox="0 0 24 24"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{ cursor: 'pointer' }}
                  >
                    <title>Inserir emoji</title>
                    <path d="M12 22.75C6.072 22.75 1.25 17.928 1.25 12S6.072 1.25 12 1.25 22.75 6.072 22.75 12 17.928 22.75 12 22.75zm0-20C6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25 21.25 17.1 21.25 12 17.1 2.75 12 2.75zm-2 9c.828 0 1.5-.672 1.5-1.5S10.828 8.75 10 8.75 8.5 9.422 8.5 10.25 9.172 11.75 10 11.75zm4 0c.828 0 1.5-.672 1.5-1.5S14.828 8.75 14 8.75 12.5 9.422 12.5 10.25 13.172 11.75 14 11.75zm-2 6.5c-2.31 0-4.32-1.35-5.31-3.32l1.32-.71c.71 1.4 2.15 2.37 3.99 2.37 1.84 0 3.28-.97 3.99-2.37l1.32.71c-.99 1.97-3 3.32-5.31 3.32z" />
                  </svg>

                  {showEmojiPicker && (
                    <EmojiPickerPopover>
                      {EMOJI_LIST.map((emoji, index) => (
                        <span key={index} onClick={() => handleAddEmoji(emoji)}>
                          {emoji}
                        </span>
                      ))}
                    </EmojiPickerPopover>
                  )}
                </div>
              </IconsContainer>

              <PostButton
                onClick={handleCreateTweet}
                disabled={
                  (!newTweetContent.trim() && !selectedImage) || isPosting
                }
              >
                Postar
              </PostButton>
            </ActionArea>
          </InputContainer>
        </TweetBoxContainer>
      )}

      <Tweets>
        {loading ? (
          <Message>A carregar...</Message>
        ) : tweets.length > 0 ? (
          tweets.map((tweet) => {
            const tweetWithId = tweet as ITweetData & { unique_id?: string };
            const identifier = tweetWithId.unique_id || `tweet-${tweet.id}`;
            return (
              <Tweet
                key={identifier}
                tweet={tweet}
                onDelete={() => handleDeleteTweet(identifier)}
              />
            );
          })
        ) : (
          <Message>Nenhum tweet encontrado.</Message>
        )}
      </Tweets>
    </Container>
  );
};

export default Feed;
