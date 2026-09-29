import styled from 'styled-components';
import { Chat, Rocket, Favorite } from 'styled-icons/material';
import { ArrowRepeat } from 'styled-icons/bootstrap';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 14px 16px;
  border-bottom: 1px solid var(--outline);
  background: var(--primary);
  color: var(--white);
`;

export const Retweeted = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--gray);
  margin-left: 35px;
  margin-bottom: 9px;
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

export const Avatar = styled.div`
  width: 49px;
  height: 49px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--gray);
  position: relative;
  cursor: pointer;
  background-size: cover;
  background-position: center;
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

  > strong {
    &:hover {
      text-decoration: underline;
    }
  }

  > span,
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
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 0, 0, 0.1);
  }
`;

export const Description = styled.p`
  font-size: 15px;
  margin-top: 4px;
  word-break: break-word;
  line-height: 20px;
`;

export const ImageContent = styled.div`
  margin-top: 12px;
  width: 100%;
  height: min(285px, max(175px, 41vw));
  background: var(--outline);
  border-radius: 14px;
  cursor: pointer;
  background-size: cover;
  background-position: center;
`;

export const VideoContent = styled.video`
  margin-top: 12px;
  width: 100%;
  max-height: 350px;
  border-radius: 14px;
  outline: none;
`;

export const ImageModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
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
  justify-content: space-between;
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
  }
`;

export const CommentIcon = styled(Chat)`
  width: 19px;
  height: 19px;
`;

export const RetweetIcon = styled(ArrowRepeat)`
  width: 19px;
  height: 19px;
`;

export const LikeIcon = styled(Favorite)<{ $isLiked?: boolean }>`
  width: 19px;
  height: 19px;
  fill: ${(props) => (props.$isLiked ? 'var(--like)' : 'currentColor')};
`;


export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

export const LikesModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--outline);

  h3 {
    font-size: 16px;
    color: var(--white);
  }

  button {
    background: transparent;
    border: none;
    color: var(--white);
    font-size: 18px;
    cursor: pointer;
  }
`;

export const CommentScrollArea = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
  padding: 0 16px;
`;

export const CommentFormArea = styled.div`
  padding: 16px;
  border-top: 1px solid var(--outline);
  flex-shrink: 0;
`;

export const CommentSection = styled.div`
  margin-top: 0;
  border-top: none;
  padding-top: 12px;
`;

export const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: none;
  padding-bottom: 0;

  textarea {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--white);
    outline: none;
    resize: none;
    font-family: inherit;
    font-size: 15px;

    &::placeholder {
      color: var(--gray);
    }
  }
`;

export const CommentActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 8px;
  gap: 12px;

  button {
    background: var(--twitter);
    color: var(--white);
    border: none;
    padding: 6px 16px;
    border-radius: 999px;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;

    &:hover {
      background: var(--twitter-dark-hover);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

export const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 12px;
`;

export const CommentItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 0;
  position: relative;
  border-bottom: 1px solid var(--outline);

  &:last-child {
    border-bottom: none;
  }

  &.is-reply {
    margin-left: 50px;
    border-bottom: none;

    &::before {
      content: '';
      position: absolute;
      top: -12px;
      left: -31px;
      width: 20px;
      height: 28px;
      border-left: 2px solid var(--outline);
      border-bottom: 2px solid var(--outline);
      border-bottom-left-radius: 8px;
    }
  }
`;

export const CommentAvatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--gray);
  background-size: cover;
  background-position: center;
`;

export const CommentContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  > div:first-child {
    display: flex;
    align-items: center;
    gap: 4px;

    strong {
      font-size: 14px;
      color: var(--white);
    }

    span {
      font-size: 13px;
      color: var(--gray);
    }
  }

  > p {
    font-size: 14px;
    margin-top: 4px;
    word-break: break-word;
    color: var(--white);
  }
`;

export const CommentItemActions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  color: var(--gray);
  font-size: 13px;
`;

export const ActionWrapper = styled.span<{ $isLiked?: boolean }>`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${(props) => (props.$isLiked ? 'var(--like)' : 'inherit')};
  transition: color 0.2s;

  &:hover {
    color: var(--like);
  }
`;

export const LikeCountSpan = styled.span`
  cursor: pointer;
`;

export const NestedRepliesContainer = styled.div<{ $isNested?: boolean }>`
  display: flex;
  flex-direction: column;
`;

export const CommentListLoading = styled.span`
  padding: 12px 0;
  display: block;
  color: var(--gray);
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
  padding: 16px 0;
  font-weight: bold;
  width: 100%;
  text-align: left;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;

export const ReplyIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--gray);

  button {
    background: transparent;
    border: none;
    color: var(--twitter);
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
    padding: 6px 12px;
    border-radius: 999px;
    transition:
      background 0.2s,
      color 0.2s;

    &:hover {
      background: rgba(51, 161, 242, 0.1);
    }
  }
`;


export const LikesList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: calc(80vh - 53px);
`;

export const LikeUserItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  button.follow,
  button.following {
    background: transparent;
    color: var(--white);
    border-color: var(--twitter);
    border: 1px solid var(--twitter);
    padding: 6px 16px;
    border-radius: 999px;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;

    &.following {
      background: var(--twitter);
      color: var(--white);
      border: 1px solid var(--outline);

      &:hover {
        border-color: var(--twitter);
        color: var(--white);
        background: var(--twitter);
      }
    }
  }
`;

export const LikeUserInner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const LikeUserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gray);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

export const LikeUserInfo = styled.div`
  display: flex;
  flex-direction: column;

  strong {
    font-size: 15px;
    color: var(--white);
  }

  span {
    font-size: 14px;
    color: var(--gray);
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
