import React, {
  useState,
  useEffect,
  useCallback,
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
  ImageIcon,
  TweetButton,
  CharCounter,
} from './styles';

interface TweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

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
              <Actions>
                <UploadImageLabel title="Adicionar foto ou vídeo">
                  <ImageIcon>📷</ImageIcon>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      handleMediaChange(e);
                      e.target.value = '';
                    }}
                  />
                </UploadImageLabel>
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
