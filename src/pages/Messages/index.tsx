import React, { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';

import {
  Container,
  ConversationsSidebar,
  Header,
  ConversationList,
  ConversationItem,
  Avatar,
  ConversationInfo,
  Username,
  Handle,
  LastMessage,
  UnreadBadge,
  ChatArea,
  ChatHeader,
  BackButton,
  ErrorMessage,
  MessagesList,
  MessageRow,
  MessageAvatar,
  MessageBubble,
  SenderLabel,
  InputArea,
  MessageInput,
  SendButton,
  EmptyChat,
} from './styles';

interface UserProfile {
  id: number;
  username: string;
  first_name?: string;
  profile?: {
    avatar?: string | null;
  };
  avatar?: string | null;
  unread_count?: number;
  unread?: number;
  unread_messages_count?: number;
  has_unread?: boolean;
  is_unread?: boolean;
  last_message?: string;
}

interface Message {
  id: number;
  sender:
    | number
    | { id: number; username: string; profile?: { avatar?: string | null } };
  recipient: number | { id: number; username: string };
  content: string;
  created_at: string;
}

const MessagesPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [conversations, setConversations] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const defaultAvatar =
    'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png';

  const getAvatarUrl = (
    userObj?: {
      profile?: { avatar?: string | null } | null;
      avatar?: string | null;
    } | null
  ) => {
    if (!userObj) return defaultAvatar;
    return userObj.profile?.avatar || userObj.avatar || defaultAvatar;
  };

  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.get('/messages/conversations/');
      setConversations(response.data);
    } catch (err) {
      console.error('Erro ao buscar conversas', err);
    }
  }, []);

  useEffect(() => {
    const initConversations = async () => {
      await fetchConversations();
    };
    initConversations();

    const conversationsInterval = setInterval(fetchConversations, 5000);
    return () => clearInterval(conversationsInterval);
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedUser) return;

    let ignore = false;
    let isFetching = false;

    const fetchMessages = async () => {
      if (isFetching) return;
      isFetching = true;

      try {
        const response = await api.get(
          `/messages/chat/${selectedUser.username}/`
        );

        if (ignore) return;

        setMessages((prevMessages) => {
          if (prevMessages.length !== response.data.length) {
            return response.data;
          }
          return prevMessages;
        });

        setError(null);
      } catch (err) {
        if (!ignore) {
          console.error('Erro ao buscar histórico de mensagens', err);
        }
      } finally {
        isFetching = false;
      }
    };

    const initMessages = async () => {
      await fetchMessages();
    };
    initMessages();

    const intervalId = setInterval(fetchMessages, 3000);

    return () => {
      ignore = true;
      clearInterval(intervalId);
    };
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectUser = (conv: UserProfile) => {
    setSelectedUser(conv);

    setConversations((prev) =>
      prev.map((item) =>
        item.id === conv.id
          ? {
              ...item,
              unread_count: 0,
              unread: 0,
              unread_messages_count: 0,
              has_unread: false,
              is_unread: false,
            }
          : item
      )
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageContent = newMessage.trim();
    if (!messageContent || !selectedUser) return;

    try {
      setError(null);
      const response = await api.post('/messages/', {
        recipient: selectedUser.id,
        content: messageContent,
      });

      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');

      setConversations((prev) =>
        prev.map((item) =>
          item.id === selectedUser.id
            ? {
                ...item,
                last_message: messageContent,
                has_unread: false,
                is_unread: false,
                unread_count: 0,
              }
            : item
        )
      );

      fetchConversations();
    } catch (err: unknown) {
      console.error('Erro ao enviar mensagem:', err);

      const apiError = err as { response?: { data?: { error?: string } } };
      if (apiError.response?.data?.error) {
        setError(apiError.response.data.error);
      } else {
        setError('Erro ao enviar mensagem. Verifique a conexão.');
      }
    }
  };

  return (
    <Container>
      <ConversationsSidebar $hideOnMobile={!!selectedUser}>
        <Header>Mensagens</Header>
        <ConversationList>
          {conversations.map((conv) => {
            const unreadCount =
              conv.unread_count ??
              conv.unread ??
              conv.unread_messages_count ??
              0;

            const hasUnread =
              unreadCount > 0 ||
              Boolean(conv.has_unread) ||
              Boolean(conv.is_unread);

            return (
              <ConversationItem
                key={conv.id}
                $isActive={selectedUser?.id === conv.id}
                $hasUnread={hasUnread}
                onClick={() => handleSelectUser(conv)}
              >
                <Avatar src={getAvatarUrl(conv)} alt={conv.username} />
                <ConversationInfo>
                  <Username $hasUnread={hasUnread}>
                    {conv.first_name || conv.username}
                  </Username>
                  <Handle>@{conv.username}</Handle>
                  <LastMessage $hasUnread={hasUnread}>
                    {hasUnread
                      ? `${unreadCount > 0 ? unreadCount : 1} nova(s) mensagem`
                      : conv.last_message || 'Clique para abrir a conversa'}
                  </LastMessage>
                </ConversationInfo>

                {hasUnread && (
                  <UnreadBadge>
                    {unreadCount > 0 ? unreadCount : ''}
                  </UnreadBadge>
                )}
              </ConversationItem>
            );
          })}
        </ConversationList>
      </ConversationsSidebar>

      <ChatArea $showOnMobile={!!selectedUser}>
        {selectedUser ? (
          <>
            <ChatHeader>
              <BackButton onClick={() => setSelectedUser(null)}>
                <FaArrowLeft />
              </BackButton>
              <Avatar
                src={getAvatarUrl(selectedUser)}
                alt={selectedUser.username}
              />
              <ConversationInfo>
                <Username>
                  {selectedUser.first_name || selectedUser.username}
                </Username>
                <Handle>@{selectedUser.username}</Handle>
              </ConversationInfo>
            </ChatHeader>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <MessagesList>
              {messages.length === 0 ? (
                <EmptyChat>Diga olá para @{selectedUser.username}!</EmptyChat>
              ) : (
                messages.map((msg) => {
                  const senderId =
                    typeof msg.sender === 'object' && msg.sender !== null
                      ? msg.sender.id
                      : msg.sender;

                  const isMine = String(senderId) === String(authUser?.id);

                  const avatarSrc = isMine
                    ? getAvatarUrl(authUser)
                    : getAvatarUrl(selectedUser);

                  const senderName = isMine
                    ? 'Você'
                    : typeof msg.sender === 'object' &&
                        msg.sender !== null &&
                        msg.sender.username
                      ? msg.sender.username
                      : selectedUser.first_name || selectedUser.username;

                  return (
                    <MessageRow key={msg.id} $isMine={isMine}>
                      <MessageAvatar src={avatarSrc} alt="Avatar" />
                      <MessageBubble $isMine={isMine}>
                        <SenderLabel $isMine={isMine}>{senderName}</SenderLabel>
                        <div>{msg.content}</div>
                      </MessageBubble>
                    </MessageRow>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </MessagesList>

            <InputArea onSubmit={handleSendMessage}>
              <MessageInput
                type="text"
                placeholder="Digite uma nova mensagem"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <SendButton type="submit" disabled={!newMessage.trim()}>
                <FaPaperPlane size={14} />
              </SendButton>
            </InputArea>
          </>
        ) : (
          <EmptyChat $hideOnMobile>
            Selecione uma conversa para começar
          </EmptyChat>
        )}
      </ChatArea>
    </Container>
  );
};

export default MessagesPage;
