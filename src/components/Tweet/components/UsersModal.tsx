import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
  LikesList,
  LikesModalContainer,
  LikesModalEmpty,
  LikesModalHeader,
  LikesModalLoading,
} from '../styles';
import type { ILikedUser } from '../types';
import Modal from './Modal';
import UserListItem from './UserListItem';

interface UsersModalProps {
  title: string;
  users: ILikedUser[];
  loading: boolean;
  emptyMessage: string;
  onClose: () => void;
  onToggleFollow: (e: MouseEvent, user: ILikedUser) => void;
}

/** Modal genérico com lista de usuários — usado em "Curtido por" e "Retuitado por". */
const UsersModal = ({
  title,
  users,
  loading,
  emptyMessage,
  onClose,
  onToggleFollow,
}: UsersModalProps) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  return (
    <Modal onClose={onClose}>
      <LikesModalContainer onClick={(e) => e.stopPropagation()}>
        <LikesModalHeader>
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </LikesModalHeader>

        <LikesList>
          {loading ? (
            <LikesModalLoading>Carregando...</LikesModalLoading>
          ) : users.length > 0 ? (
            users.map((u, index) => (
              <UserListItem
                key={`${u.id}-${index}`}
                user={u}
                isMe={currentUser?.username === u.username}
                onToggleFollow={onToggleFollow}
                onSelect={() => {
                  onClose();
                  navigate(`/profile/${u.username}`);
                }}
              />
            ))
          ) : (
            <LikesModalEmpty>{emptyMessage}</LikesModalEmpty>
          )}
        </LikesList>
      </LikesModalContainer>
    </Modal>
  );
};

export default UsersModal;
