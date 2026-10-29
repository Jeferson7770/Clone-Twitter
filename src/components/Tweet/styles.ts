import styled, { css, keyframes } from 'styled-components';
import { Chat, Rocket, Favorite } from 'styled-icons/material';
import { ArrowRepeat } from 'styled-icons/bootstrap';

const highlightAnimation = keyframes`
  0% {
    background-color: rgba(29, 155, 240, 0.25);
  }
  100% {
    background-color: transparent;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 14px 16px;
  border-bottom: 1px solid var(--outline);
  background: var(--primary);
  color: var(--white);
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--hover, rgba(255, 255, 255, 0.03));
  }
`;

export const Retweeted = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--gray);
  margin-left: 35px;
  margin-bottom: 9px;
  font-weight: 600;
`;

export const Icon = styled(Rocket)`
  width: 16px;
  height: 16px;
  margin-right: 9px;
  fill: var(--gray);
`;

export const Body = styled.div`
  display: flex;
  position: relative;
`;

export const Avatar = styled.div<{ $avatarUrl?: string }>`
  width: 49px;
  height: 49px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--gray);
  position: relative;
  cursor: pointer;
  background-size: cover;
  background-position: center;

  ${(props) =>
    props.$avatarUrl &&
    css`
      background-image: url(${props.$avatarUrl});
    `}
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-left: 11px;
  cursor: pointer;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  white-space: nowrap;
`;

export const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;

  > strong {
    color: var(--white);

    &:hover {
      text-decoration: underline;
    }
  }

  > span {
    color: var(--twitter);

    &:hover {
      text-decoration: underline;
    }
  }

  time {
    color: var(--gray);
    font-size: 14px;
  }
`;

export const Dot = styled.div`
  width: 2px;
  height: 2px;
  background: var(--gray);
  border-radius: 50%;
  margin: 0 4px;
`;

export const DeleteButton = styled.button`
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: var(--gray);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: rgba(244, 33, 46, 0.1);
    color: var(--danger);
  }

  svg {
    fill: currentColor;
  }
`;

export const Description = styled.p`
  font-size: 15px;
  margin-top: 4px;
  word-break: break-word;
  line-height: 20px;
  color: var(--white);
`;

export const ImageContent = styled.div<{ $mediaUrl?: string }>`
  margin-top: 12px;
  width: 100%;
  height: min(285px, max(175px, 41vw));
  background: var(--outline);
  border-radius: 14px;
  cursor: pointer;
  background-size: cover;
  background-position: center;

  ${(props) =>
    props.$mediaUrl &&
    css`
      background-image: url(${props.$mediaUrl});
    `}
`;

export const VideoContent = styled.video`
  margin-top: 12px;
  width: 100%;
  max-height: 350px;
  border-radius: 14px;
  outline: none;
  object-fit: contain;
`;

export const ImageModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--modal-bg, rgba(0, 0, 0, 0.85));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContentBox = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CloseImageButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: var(--white);
  font-size: 24px;
  cursor: pointer;
`;

export const ExpandedImage = styled.img`
  max-width: 100%;
  max-height: 85vh;
  border-radius: 8px;
  object-fit: contain;
`;

export const Icons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 32px;
  width: 100%;
  margin-top: 11px;
  padding-right: 16px;

  > div {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--twitter);
    }
  }
`;

export const Status = styled.div<{
  $isLiked?: boolean;
  $isRetweeted?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${(props) =>
    props.$isLiked
      ? 'var(--like)'
      : props.$isRetweeted
        ? 'var(--retweet)'
        : 'var(--gray)'};

  &.active-like {
    color: var(--like);
  }

  &.active-retweet {
    color: var(--retweet);
  }

  .clickable-likes {
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  svg {
    fill: currentColor;
  }
`;

export const CommentIcon = styled(Chat)<{ $hasReplies?: boolean }>`
  width: 18px;
  height: 18px;
  fill: ${(props) => (props.$hasReplies ? 'var(--twitter)' : 'currentColor')};
  transition: fill 0.2s;
`;

export const RetweetIcon = styled(ArrowRepeat)<{ $isRetweeted?: boolean }>`
  width: 19px;
  height: 19px;
  fill: ${(props) =>
    props.$isRetweeted ? 'var(--retweet)' : 'currentColor'} !important;
  color: ${(props) =>
    props.$isRetweeted ? 'var(--retweet)' : 'currentColor'} !important;
  stroke: ${(props) =>
    props.$isRetweeted ? 'var(--retweet)' : 'currentColor'} !important;
  transition:
    fill 0.2s,
    color 0.2s,
    stroke 0.2s;
`;

export const LikeIcon = styled(Favorite)<{ $isLiked?: boolean }>`
  width: 18px;
  height: 18px;
  fill: ${(props) =>
    props.$isLiked ? 'var(--like)' : 'currentColor'} !important;
  color: ${(props) =>
    props.$isLiked ? 'var(--like)' : 'currentColor'} !important;
  transition:
    fill 0.2s,
    color 0.2s;
`;

export const CommentHeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid var(--outline);
`;

export const CommentHeaderTitle = styled.span`
  font-weight: bold;
  font-size: 14px;
  color: var(--gray);
`;

export const CloseCommentsButton = styled.button`
  background: none;
  border: none;
  color: var(--white);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 50%;

  &:hover {
    background: var(--hover, rgba(255, 255, 255, 0.1));
  }
`;

export const RetweetCountSpan = styled.span`
  cursor: pointer;
  margin-left: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

export const TrashIconSpan = styled.span`
  font-size: 14px;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--modal-bg, rgba(91, 112, 131, 0.4));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const LikesModalContainer = styled.div<{ $isCommentModal?: boolean }>`
  background: var(--primary);
  width: 100%;
  max-width: ${(props) => (props.$isCommentModal ? '600px' : '450px')};
  max-height: ${(props) => (props.$isCommentModal ? '90vh' : '80vh')};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 12px var(--shadow, rgba(0, 0, 0, 0.3));
  border: 1px solid var(--outline);
`;

export const LikesModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--outline);

  h3 {
    font-size: 18px;
    font-weight: bold;
    color: var(--white);
  }

  button {
    background: transparent;
    border: none;
    color: var(--white);
    font-size: 18px;
    cursor: pointer;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;

    &:hover {
      background: var(--hover, rgba(255, 255, 255, 0.1));
    }
  }
`;

export const CommentScrollArea = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 350px;
  padding: 0 8px;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const CommentSection = styled.div`
  margin-top: 0;
  border-top: none;
  padding-top: 4px;
`;

export const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 0;
`;

/**
 * Comentário no padrão do X:
 * - todos os comentários ficam no MESMO nível (sem recuo em cascata);
 * - quando `$hasThread` é true, uma linha fina liga o avatar deste
 *   comentário ao avatar do comentário seguinte (a "thread line").
 */
export const CommentItem = styled.div<{
  $isHighlighted?: boolean;
  $hasThread?: boolean;
}>`
  display: flex;
  gap: 12px;
  padding: 12px 8px ${(props) => (props.$hasThread ? '0' : '12px')} 8px;
  position: relative;
  border-radius: 8px;
  transition: background-color 0.3s ease;

  ${(props) =>
    props.$hasThread &&
    css`
      &::before {
        content: '';
        position: absolute;
        /* 8px (padding) + 19px (centro do avatar) - 1px (metade da linha) */
        left: 26px;
        /* 12px (padding) + 38px (avatar) + 4px (respiro) */
        top: 54px;
        /* chega até 4px acima do avatar do próximo comentário */
        bottom: -8px;
        width: 2px;
        border-radius: 1px;
        background: var(--outline);
        pointer-events: none;
      }
    `}

  ${(props) =>
    props.$isHighlighted &&
    css`
      animation: ${highlightAnimation} 3.5s ease-out forwards;
    `}

  &.is-reply {
    margin-left: 0;
  }
`;

export const CommentAvatar = styled.div<{ $avatarUrl?: string }>`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--gray);
  background-size: cover;
  background-position: center;
  cursor: pointer;
  position: relative;
  z-index: 1;

  ${(props) =>
    props.$avatarUrl &&
    css`
      background-image: url(${props.$avatarUrl});
    `}
`;

export const CommentContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;

  > p {
    font-size: 14px;
    margin-top: 2px;
    word-break: break-word;
    color: var(--white);
    line-height: 20px;
  }
`;

export const CommentAuthorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  strong {
    font-size: 14px;
    color: var(--white);

    &:hover {
      text-decoration: underline;
    }
  }

  span {
    font-size: 13px;
    color: var(--twitter);
  }
`;

export const CommentItemActions = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 8px;
  color: var(--gray);
  font-size: 13px;
`;

export const ActionWrapper = styled.span<{
  $isLiked?: boolean;
  $isCommented?: boolean;
}>`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${(props) =>
    props.$isLiked
      ? 'var(--like)'
      : props.$isCommented
        ? 'var(--twitter)'
        : 'var(--gray)'};
  transition:
    color 0.2s,
    transform 0.1s;

  &:hover {
    color: ${(props) => (props.$isLiked ? 'var(--like)' : 'var(--twitter)')};
    transform: scale(1.05);
  }

  svg {
    fill: currentColor;
  }
`;

export const LikeCountSpan = styled.span`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

/**
 * Respostas (sub-comentários) no estilo LinkedIn:
 * - recuam UMA vez em relação ao comentário principal (alinhadas ao texto dele);
 * - cada resposta tem uma curva ligando ao avatar do comentário principal;
 * - respostas de respostas (containers dentro de containers) NÃO recuam mais:
 *   ficam alinhadas ao primeiro nível de resposta.
 * (A prop `$isNested` foi mantida só para não quebrar o TSX existente.)
 */
export const NestedRepliesContainer = styled.div<{ $isNested?: boolean }>`
  display: flex;
  flex-direction: column;
  /* 8px (padding) + 38px (avatar) + 12px (gap) = 58px  ->  58 - 8 = 50px */
  margin: 0 0 0 50px;
  padding: 0;
  border: none;

  /* níveis mais profundos continuam alinhados ao primeiro nível */
  & & {
    margin-left: 0;
  }

  /* avatares menores nas respostas */
  ${CommentAvatar} {
    width: 32px;
    height: 32px;
  }

  ${CommentItem} {
    /* linha vertical que continua até a próxima resposta */
    &::before {
      content: '';
      position: absolute;
      left: -24px;
      top: 28px;
      bottom: 0;
      width: 2px;
      border-radius: 0;
      background: var(--outline);
      pointer-events: none;
    }

    /* a última resposta não continua a linha */
    &:last-child::before {
      content: none;
    }

    /* curva que liga a linha do comentário principal ao avatar da resposta */
    &::after {
      content: '';
      position: absolute;
      left: -24px;
      top: 0;
      width: 30px;
      height: 29px;
      box-sizing: border-box;
      border-left: 2px solid var(--outline);
      border-bottom: 2px solid var(--outline);
      border-bottom-left-radius: 12px;
      pointer-events: none;
    }
  }
`;

export const ReplyingToTag = styled.div`
  font-size: 13px;
  color: var(--gray);
  margin-top: 2px;
  margin-bottom: 4px;

  span {
    color: var(--twitter);
  }
`;

export const ToggleRepliesButton = styled.button`
  background: transparent;
  border: none;
  color: var(--gray);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 8px 58px; /* alinha com o texto do comentário (8 + 38 + 12) */
  padding: 4px 0;
  transition: color 0.2s;

  /* dentro das respostas o avatar é de 32px (8 + 32 + 12) */
  ${NestedRepliesContainer} & {
    margin-left: 52px;
  }

  .line {
    width: 24px;
    height: 1px;
    background-color: var(--gray);
  }

  &:hover {
    color: var(--white);

    .line {
      background-color: var(--white);
    }
  }
`;

export const CommentListLoading = styled.span`
  padding: 12px 0;
  display: block;
  color: var(--gray);
  text-align: center;
`;

export const CommentListEmpty = styled.span`
  padding: 12px 0;
  display: block;
  color: var(--gray);
  text-align: center;
`;

export const LoadMoreButton = styled.button`
  background: transparent;
  color: var(--twitter);
  border: none;
  cursor: pointer;
  padding: 12px 0;
  font-weight: bold;
  width: 100%;
  text-align: center;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;

export const LikesList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: calc(80vh - 53px);

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const LikeUserItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--hover, rgba(255, 255, 255, 0.03));
  }
`;

export const EditButton = styled.button<{ $outlined?: boolean }>`
  background: ${(props) =>
    props.$outlined ? 'transparent' : 'var(--twitter)'};
  color: ${(props) => (props.$outlined ? 'var(--twitter)' : 'var(--white)')};
  border: ${(props) => (props.$outlined ? '1px solid var(--twitter)' : 'none')};
  padding: 6px 16px;
  border-radius: 999px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: ${(props) =>
      props.$outlined
        ? 'var(--hover, rgba(29, 161, 242, 0.1))'
        : 'var(--twitter-dark-hover)'};
  }
`;

export const LikeUserInner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const LikeUserAvatar = styled.div<{ $avatarUrl?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gray);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;

  ${(props) =>
    props.$avatarUrl &&
    css`
      background-image: url(${props.$avatarUrl});
    `}
`;

export const LikeUserInfo = styled.div`
  display: flex;
  flex-direction: column;

  strong {
    font-size: 15px;
    color: var(--white);

    &:hover {
      text-decoration: underline;
    }
  }

  span {
    font-size: 14px;
    color: var(--twitter);
  }
`;

export const LikesModalLoading = styled.p`
  padding: 16px;
  color: var(--gray);
  text-align: center;
`;

export const LikesModalEmpty = styled.p`
  padding: 16px;
  color: var(--gray);
  text-align: center;
`;

export const RetweetWrapper = styled.div`
  position: relative;
`;

export const RetweetDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--primary);
  border: 1px solid var(--outline);
  border-radius: 12px;
  box-shadow: 0px 4px 15px var(--shadow, rgba(0, 0, 0, 0.15));
  z-index: 10;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: max-content;
  margin-top: 8px;
`;

export const DropdownItem = styled.button`
  padding: 14px 20px;
  text-align: left;
  font-size: 15px;
  font-weight: bold;
  color: var(--white);
  cursor: pointer;
  background: transparent;
  border: none;
  transition: background 0.2s;

  &:hover {
    background-color: var(--hover, rgba(255, 255, 255, 0.05));
  }
`;

export const QuotePreview = styled.div`
  border: 1px solid var(--outline);
  border-radius: 16px;
  padding: 14px;
  margin: 16px 0;
  background-color: var(--quote-bg, rgba(255, 255, 255, 0.02));

  strong {
    font-size: 15px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--white);

    span {
      font-weight: normal;
      color: var(--twitter);
    }
  }

  p {
    margin-top: 6px;
    font-size: 15px;
    line-height: 22px;
    color: var(--white);
    word-break: break-word;
  }
`;

export const QuotedTweetCard = styled.div`
  margin-top: 12px;
  border: 1px solid var(--outline);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--hover, rgba(255, 255, 255, 0.03));
  }
`;

export const QuotedHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  margin-bottom: 4px;

  strong {
    color: var(--white);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      text-decoration: underline;
    }
  }

  span {
    color: var(--twitter);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const QuotedAvatar = styled.div<{ $avatarUrl?: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--gray);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;

  ${(props) =>
    props.$avatarUrl &&
    css`
      background-image: url(${props.$avatarUrl});
    `}
`;

export const QuotedContent = styled.p`
  font-size: 15px;
  color: var(--white);
  line-height: 20px;
  word-break: break-word;
`;

export const DeleteModalCard = styled.div`
  background: var(--primary);
  color: var(--white);
  width: 100%;
  max-width: 460px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-shadow: 0 10px 25px var(--shadow, rgba(0, 0, 0, 0.3));
  border: 1px solid var(--outline);

  h3 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--white);
  }

  p {
    font-size: 15px;
    color: var(--gray);
    margin-bottom: 24px;
    line-height: 22px;
  }
`;

export const DeleteModalContainer = styled(DeleteModalCard)``;

export const DeleteModalText = styled.p`
  color: var(--gray);
  font-size: 15px;
  line-height: 20px;
  margin-bottom: 24px;
  margin-top: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
    sans-serif;
`;

export const DeleteModalRowActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;

  button.confirm-btn {
    background-color: var(--danger);
    color: var(--white);
    border: none;
    border-radius: 9999px;
    padding: 8px 24px;
    font-weight: bold;
    font-size: 15px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--danger-hover);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  button.cancel-btn {
    background-color: var(--white);
    color: var(--secondary);
    border: none;
    border-radius: 9999px;
    padding: 8px 20px;
    font-weight: bold;
    font-size: 15px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--white);
    }
  }
`;

export const ReplyModalContainer = styled.div`
  background: var(--primary);
  border: 1px solid var(--outline);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 24px var(--shadow, rgba(0, 0, 0, 0.2));
`;

export const ReplyModalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;

  button {
    background: transparent;
    border: none;
    color: var(--white);
    font-size: 18px;
    cursor: pointer;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--hover, rgba(255, 255, 255, 0.1));
    }
  }
`;

export const ReplyModalBody = styled.div`
  padding: 0 16px 16px 16px;
  display: flex;
  flex-direction: column;
`;

export const ReplyTweetParent = styled.div`
  display: flex;
  gap: 12px;

  .left-column {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .right-column {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
`;

export const ReplyThreadLine = styled.div`
  width: 2px;
  flex: 1;
  background-color: var(--outline);
  margin-top: 4px;
  margin-bottom: 4px;
`;

export const ReplyReplyingToText = styled.p`
  font-size: 14px;
  color: var(--gray);
  margin-top: 12px;
  margin-bottom: 12px;

  span {
    color: var(--twitter);
  }
`;

export const ReplyFormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;

  .form-row {
    display: flex;
    gap: 12px;

    textarea {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: var(--white);
      font-size: 18px;
      font-family: inherit;
      resize: none;
      line-height: 24px;
      padding-top: 8px;

      &::placeholder {
        color: var(--gray);
      }
    }
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid var(--outline);
    padding-top: 12px;
  }
`;

export const ReplySubmitButton = styled.button`
  background-color: var(--twitter);
  color: var(--white);
  border: none;
  border-radius: 9999px;
  padding: 8px 18px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--twitter-light-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const QuoteModalContainer = styled.div`
  background: var(--primary);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 12px var(--shadow, rgba(0, 0, 0, 0.3));
  border: 1px solid var(--outline);
`;

export const QuoteModalScrollArea = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: calc(90vh - 65px);
  padding: 0 16px 16px 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--outline);
    border-radius: 3px;
  }
`;
