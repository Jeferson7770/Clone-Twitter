import type { FormEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Avatar,
  Description,
  Dot,
  HeaderInfo,
  ReplyFormContainer,
  ReplyModalBody,
  ReplyModalContainer,
  ReplyModalHeader,
  ReplyReplyingToText,
  ReplySubmitButton,
  ReplyThreadLine,
  ReplyTweetParent,
} from '../styles';
import type { IComment, ITweetData } from '../types';
import { getAvatarUrl } from '../utils';
import Modal from './Modal';
import QuotedTweet from './QuotedTweet';
import TweetMedia from './TweetMedia';

interface ReplyModalProps {
  tweet: ITweetData;
  replyingTo: IComment | null;
  formattedDate: string;
  text: string;
  loading: boolean;
  onTextChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}

/** Modal de resposta exibindo o tweet/comentário e o tweet citado aninhado, se existir. */
const ReplyModal = ({
  tweet,
  replyingTo,
  formattedDate,
  text,
  loading,
  onTextChange,
  onSubmit,
  onClose,
}: ReplyModalProps) => {
  const { user } = useAuth();

  const isReplyingToComment = replyingTo !== null;

  // Se estiver a responder a um comentário, o alvo é o comentário; caso contrário, é o tweet.
  const target = replyingTo ?? tweet;

  const targetName = target?.author?.first_name || target?.author?.username;
  const targetUsername = target?.author?.username;

  // Verifica se o alvo é um tweet com citação/retweet aninhado
  const quotedTweetData = !isReplyingToComment
    ? (target as ITweetData)?.quoted_tweet
    : null;

  return (
    <Modal onClose={onClose}>
      <ReplyModalContainer onClick={(e) => e.stopPropagation()}>
        <ReplyModalHeader>
          <button type="button" onClick={onClose} title="Fechar">
            ✕
          </button>
        </ReplyModalHeader>

        <ReplyModalBody>
          <ReplyTweetParent>
            <div className="left-column">
              <Avatar
                $avatarUrl={getAvatarUrl(target?.author?.profile?.avatar)}
              />
              <ReplyThreadLine />
            </div>
            <div className="right-column">
              <HeaderInfo>
                <strong>{targetName}</strong>
                <span>@{targetUsername}</span>
                {!isReplyingToComment && (
                  <>
                    <Dot />
                    <time>{formattedDate}</time>
                  </>
                )}
              </HeaderInfo>

              {/* Exibe o comentário/texto escrito pelo utilizador */}
              {target?.content && <Description>{target.content}</Description>}

              {/* Exibe a mídia direta, caso exista no tweet principal */}
              {target?.media && (
                <TweetMedia
                  media={target.media}
                  mediaType={target.media_type}
                />
              )}

              {/* Exibe o card do Tweet Citado (com imagem e conteúdo original) */}
              {quotedTweetData && (
                <div style={{ marginTop: 8 }}>
                  <QuotedTweet
                    tweet={quotedTweetData}
                    onOpen={() => {}}
                    onUserClick={() => {}}
                  />
                </div>
              )}
            </div>
          </ReplyTweetParent>

          <ReplyFormContainer onSubmit={onSubmit}>
            <div className="form-row">
              <Avatar $avatarUrl={getAvatarUrl(user?.profile?.avatar)} />
              <div className="right-column">
                <ReplyReplyingToText>
                  Em resposta a <span>@{targetUsername}</span>
                </ReplyReplyingToText>

                <textarea
                  rows={3}
                  placeholder="Postar sua resposta..."
                  value={text}
                  onChange={(e) => onTextChange(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="form-footer">
              <ReplySubmitButton
                type="submit"
                disabled={loading || !text.trim()}
              >
                {loading ? 'Enviando...' : 'Responder'}
              </ReplySubmitButton>
            </div>
          </ReplyFormContainer>
        </ReplyModalBody>
      </ReplyModalContainer>
    </Modal>
  );
};

export default ReplyModal;
