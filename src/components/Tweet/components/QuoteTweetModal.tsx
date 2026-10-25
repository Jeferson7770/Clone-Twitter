import type { FormEvent } from 'react';
import {
  QuoteModalContainer,
  LikesModalHeader,
  QuoteModalScrollArea,
  QuotePreview,
  ReplySubmitButton,
} from '../styles';
import type { ITweetData } from '../types';
import Modal from './Modal';
import QuotedTweet from './QuotedTweet';
import TweetMedia from './TweetMedia';
import { getAvatarUrl } from '../utils';

interface QuoteTweetModalProps {
  tweet: ITweetData;
  text?: string;
  loading?: boolean;
  onTextChange?: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}

/** Modal "Comentar no Retweet" com scroll, prévia e botão de postar visíveis. */
const QuoteTweetModal = ({
  tweet,
  text = '',
  loading = false,
  onTextChange,
  onSubmit,
  onClose,
}: QuoteTweetModalProps) => {
  const author = tweet?.author;
  const avatarUrl = getAvatarUrl(author?.profile?.avatar);
  const quotedTweetData = tweet?.quoted_tweet;

  return (
    <Modal onClose={() => onClose?.()}>
      <QuoteModalContainer onClick={(e) => e.stopPropagation()}>
        <LikesModalHeader>
          <h3>Comentar no Retweet</h3>
          <button type="button" onClick={() => onClose?.()} title="Fechar">
            ✕
          </button>
        </LikesModalHeader>

        <QuoteModalScrollArea>
          <form onSubmit={(e) => onSubmit?.(e)}>
            <textarea
              rows={3}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--white)',
                outline: 'none',
                fontSize: 18,
                resize: 'none',
                marginBottom: 12,
                marginTop: 12,
              }}
              placeholder="Adicione um comentário..."
              value={text}
              onChange={(e) => onTextChange?.(e.target.value)}
              autoFocus
            />

            <QuotePreview>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'var(--gray)',
                    backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <strong>
                  {author?.first_name || author?.username}{' '}
                  <span>@{author?.username}</span>
                </strong>
              </div>

              {tweet?.content && <p>{tweet.content}</p>}

              {tweet?.media && (
                <div style={{ marginTop: 8 }}>
                  <TweetMedia
                    media={tweet.media}
                    mediaType={tweet.media_type}
                    stopPropagation
                  />
                </div>
              )}

              {quotedTweetData && (
                <div style={{ marginTop: 8 }}>
                  <QuotedTweet
                    tweet={quotedTweetData}
                    onOpen={() => {}}
                    onUserClick={() => {}}
                  />
                </div>
              )}
            </QuotePreview>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 12,
                borderTop: '1px solid var(--outline)',
                paddingTop: 12,
              }}
            >
              <ReplySubmitButton
                type="submit"
                disabled={loading || !text || !text.trim()}
              >
                {loading ? 'Enviando...' : 'Postar'}
              </ReplySubmitButton>
            </div>
          </form>
        </QuoteModalScrollArea>
      </QuoteModalContainer>
    </Modal>
  );
};

export default QuoteTweetModal;
