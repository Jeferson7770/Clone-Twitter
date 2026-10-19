import styled, { css } from 'styled-components';
import { Favorite, Chat, PersonAdd } from 'styled-icons/material';
import { ArrowRepeat } from 'styled-icons/bootstrap';
import { Twitter } from 'styled-icons/boxicons-logos';

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

export const ModalContainer = styled.div`
  background: var(--primary);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 10000;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--outline);

  h2 {
    font-size: 20px;
    font-weight: bold;
    color: var(--white);
  }
`;

export const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--white);
  font-size: 28px;
  line-height: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: rgba(128, 128, 128, 0.2);
  }
`;

export const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--outline);
    border-radius: 4px;
  }
`;

export const NotificationItem = styled.div<{ $isUnread?: boolean }>`
  display: flex;
  padding: 16px;
  border-bottom: 1px solid var(--outline);
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
  background-color: ${(props) =>
    props.$isUnread ? 'rgba(29, 155, 240, 0.06)' : 'transparent'};

  &:hover {
    background: rgba(128, 128, 128, 0.1);
  }
`;

export const UnreadDot = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background-color: var(--twitter, #1d9bf0);
  border-radius: 50%;
`;

export const IconArea = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 48px;
  margin-right: 12px;
  padding-top: 4px;
`;

export const LikeIcon = styled(Favorite)`
  width: 30px;
  height: 30px;
  fill: var(--like);
`;

export const RetweetIcon = styled(ArrowRepeat)`
  width: 30px;
  height: 30px;
  fill: var(--retweet);
`;

export const CommentIcon = styled(Chat)`
  width: 30px;
  height: 30px;
  fill: var(--twitter);
`;

export const PostIcon = styled(Twitter)`
  width: 30px;
  height: 30px;
  fill: var(--twitter);
`;

export const FollowIcon = styled(PersonAdd)`
  width: 30px;
  height: 30px;
  fill: var(--twitter);
`;

export const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const UserAvatar = styled.div<{ $avatarUrl?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gray);
  background-size: cover;
  background-position: center;
  margin-bottom: 8px;
  cursor: pointer;

  ${(props) =>
    props.$avatarUrl &&
    css`
      background-image: url(${props.$avatarUrl});
    `}
`;

export const UserInfo = styled.div`
  font-size: 15px;
  color: var(--white);
  margin-bottom: 8px;

  > strong {
    font-weight: bold;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  > span {
    color: var(--gray);
  }
`;

export const TweetPreview = styled.p`
  font-size: 15px;
  color: var(--gray);
  line-height: 20px;
`;

export const LoadingState = styled.div`
  padding: 20px;
  text-align: center;
  color: var(--gray);
`;

export const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  color: var(--gray);
`;
