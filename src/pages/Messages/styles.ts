import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: var(--primary);
  color: var(--white);
  overflow: hidden;
`;

export const ConversationsSidebar = styled.div<{ $hideOnMobile?: boolean }>`
  width: 380px;
  min-width: 380px;
  flex-shrink: 0;
  border-right: 1px solid var(--outline);
  display: flex;
  flex-direction: column;
  height: 100%;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
    border-right: none;
    display: ${(props) => (props.$hideOnMobile ? 'none' : 'flex')};
  }
`;

export const Header = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--outline);
  font-size: 20px;
  font-weight: 700;
  color: var(--white);
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 2;
`;

export const ConversationList = styled.div`
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--outline) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--outline);
    border-radius: 3px;
  }
`;

export const ConversationItem = styled.div<{
  $isActive?: boolean;
  $hasUnread?: boolean;
}>`
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
  cursor: pointer;
  position: relative;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  background-color: ${(props) =>
    props.$isActive
      ? 'var(--twitter-dark-hover)'
      : props.$hasUnread
        ? 'rgba(29, 161, 242, 0.15)'
        : 'transparent'};

  border-left: ${(props) =>
    props.$isActive || props.$hasUnread
      ? '4px solid var(--twitter)'
      : '4px solid transparent'};

  &:hover {
    background-color: ${(props) =>
      props.$isActive
        ? 'var(--twitter-dark-hover)'
        : props.$hasUnread
          ? 'rgba(29, 161, 242, 0.22)'
          : 'var(--twitter-dark-hover)'};
  }
`;

export const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  background-color: var(--search);
  flex-shrink: 0;
`;

export const ConversationInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
  min-width: 0;
`;

export const Username = styled.span<{ $hasUnread?: boolean }>`
  font-weight: ${(props) => (props.$hasUnread ? '800' : '700')};
  color: var(--white);
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Handle = styled.span`
  color: var(--gray);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const LastMessage = styled.span<{ $hasUnread?: boolean }>`
  color: ${(props) => (props.$hasUnread ? 'var(--twitter)' : 'var(--gray)')};
  font-weight: ${(props) => (props.$hasUnread ? '600' : '400')};
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
`;

export const UnreadBadge = styled.span`
  background-color: var(--twitter);
  color: var(--white);
  font-size: 11px;
  font-weight: bold;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding: 0 4px;
  flex-shrink: 0;
`;

export const ChatArea = styled.div<{ $showOnMobile?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--primary);
  min-width: 0;

  @media (max-width: 768px) {
    width: 100%;
    display: ${(props) => (props.$showOnMobile ? 'flex' : 'none')};
  }
`;

export const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--outline);
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 2;
`;

export const BackButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--white);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 50%;

  &:hover {
    background-color: var(--twitter-dark-hover);
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const ErrorMessage = styled.div`
  background-color: rgba(232, 38, 94, 0.1);
  border-bottom: 1px solid rgba(232, 38, 94, 0.3);
  color: var(--like);
  padding: 10px 16px;
  font-size: 13px;
  text-align: center;
  font-weight: 500;
`;

export const MessagesList = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: var(--outline) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--outline);
    border-radius: 3px;
  }
`;

export const MessageRow = styled.div<{ $isMine?: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex-direction: ${(props) => (props.$isMine ? 'row-reverse' : 'row')};
  align-self: ${(props) => (props.$isMine ? 'flex-end' : 'flex-start')};
  max-width: 75%;
`;

export const MessageAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background-color: var(--search);
  flex-shrink: 0;
`;

export const SenderLabel = styled.span<{ $isMine?: boolean }>`
  font-size: 11px;
  font-weight: 600;
  color: ${(props) =>
    props.$isMine ? 'rgba(255, 255, 255, 0.75)' : 'var(--gray)'};
  margin-bottom: 2px;
  display: block;
`;

export const MessageBubble = styled.div<{ $isMine?: boolean }>`
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 15px;
  line-height: 20px;
  word-break: break-word;
  background-color: ${(props) =>
    props.$isMine ? 'var(--twitter)' : 'var(--outline)'};
  color: var(--white);
  border-bottom-right-radius: ${(props) => (props.$isMine ? '4px' : '20px')};
  border-bottom-left-radius: ${(props) => (props.$isMine ? '20px' : '4px')};
`;

export const InputArea = styled.form`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--outline);
  background-color: var(--primary);
`;

export const MessageInput = styled.input`
  flex: 1;
  background-color: var(--search);
  border: 1px solid transparent;
  border-radius: 9999px;
  padding: 10px 18px;
  color: var(--white);
  font-size: 15px;

  &:focus {
    outline: none;
    border-color: var(--twitter);
    background-color: var(--primary);
  }

  &::placeholder {
    color: var(--gray);
  }
`;

export const SendButton = styled.button`
  background-color: var(--twitter);
  color: var(--white);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background-color: var(--twitter-light-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const EmptyChat = styled.div<{ $hideOnMobile?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray);
  font-size: 15px;
  text-align: center;
  padding: 20px;

  @media (max-width: 768px) {
    display: ${(props) => (props.$hideOnMobile ? 'none' : 'flex')};
  }
`;
