import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

import {
  Overlay,
  ModalContainer,
  Header,
  CloseButton,
  Body,
  Avatar,
  Form,
  TextArea,
  ImagePreviewContainer,
  ImagePreview,
  VideoPreview,
  RemoveImageButton,
  Footer,
  Actions,
  UploadImageLabel,
  TweetButton,
  CharCounter,
  EmojiPickerPopover,
} from './styles';

interface TweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

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

export const TweetModal: React.FC<TweetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveMedia = useCallback(() => {
    setMediaFile(null);
    setMediaType(null);
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
      setMediaPreview(null);
    }
  }, [mediaPreview]);

  const handleClose = useCallback(() => {
    setContent('');
    handleRemoveMedia();
    setShowEmojiPicker(false);
    onClose();
  }, [handleRemoveMedia, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);

      if (file.type.startsWith('video/')) {
        setMediaType('video');
      } else {
        setMediaType('image');
      }

      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) return;

    setLoading(true);

    try {
      const formData = new FormData();
      if (content.trim()) {
        formData.append('content', content.trim());
      }
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      await api.post('/tweets/', formData);

      handleClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Erro ao postar tweet:', err);
      alert('Não foi possível enviar a postagem.');
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = (!content.trim() && !mediaFile) || loading;
  const charsLeft = 280 - content.length;

  const modalContent = (
    <Overlay onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <CloseButton type="button" onClick={handleClose}>
            ✕
          </CloseButton>
        </Header>

        <Body>
          <Avatar
            src={
              user?.profile?.avatar ||
              'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
            }
            alt={user?.first_name || user?.username || 'Usuário'}
          />

          <Form onSubmit={handleSubmit}>
            <TextArea
              placeholder="O que está acontecendo?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              maxLength={280}
            />

            {mediaPreview && (
              <ImagePreviewContainer>
                <RemoveImageButton type="button" onClick={handleRemoveMedia}>
                  ✕
                </RemoveImageButton>

                {mediaType === 'video' ? (
                  <VideoPreview src={mediaPreview} controls />
                ) : (
                  <ImagePreview src={mediaPreview} alt="Preview da imagem" />
                )}
              </ImagePreviewContainer>
            )}

            <Footer>
              <Actions
                style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
              >
                <UploadImageLabel
                  title="Adicionar foto ou vídeo"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    style={{ fill: 'currentColor' }}
                  >
                    <title>Adicionar imagem</title>
                    <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C1.881 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z" />
                  </svg>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*,video/*"
                    onChange={(e) => {
                      handleMediaChange(e);
                      e.target.value = '';
                    }}
                  />
                </UploadImageLabel>

                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{ cursor: 'pointer', fill: 'currentColor' }}
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
              </Actions>

              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                {content.length > 0 && (
                  <CharCounter $isWarning={charsLeft <= 20}>
                    {charsLeft}
                  </CharCounter>
                )}

                <TweetButton type="submit" disabled={isButtonDisabled}>
                  {loading ? 'Enviando...' : 'Tweetar'}
                </TweetButton>
              </div>
            </Footer>
          </Form>
        </Body>
      </ModalContainer>
    </Overlay>
  );

  return createPortal(modalContent, document.body);
};

export default TweetModal;
