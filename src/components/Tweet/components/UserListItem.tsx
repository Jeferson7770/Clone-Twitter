import type { MouseEvent } from 'react';
import {
  EditButton, 
  LikeUserAvatar,
  LikeUserInfo,
  LikeUserInner,
  LikeUserItem,
} from '../styles';
import type { ILikedUser } from '../types';
import { getAvatarUrl } from '../utils';

interface UserListItemProps {
  user: ILikedUser;
  isMe: boolean;
  onSelect: () => void;
  onToggleFollow: (e: MouseEvent, user: ILikedUser) => void;
}

const UserListItem = ({
  user,
  isMe,
  onSelect,
  onToggleFollow,
}: UserListItemProps) => (
  <LikeUserItem
    onClick={(e) => {
      e.stopPropagation();
      onSelect();
    }}
  >
    <LikeUserInner>
      <LikeUserAvatar $avatarUrl={getAvatarUrl(user.profile?.avatar)} />
      <LikeUserInfo>
        <strong>{user.first_name || user.username}</strong>
        <span>@{user.username}</span>
      </LikeUserInfo>
    </LikeUserInner>

    {!isMe && (
      <EditButton
        $outlined={!user.is_following}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFollow(e, user);
        }}
      >
        {user.is_following ? 'Seguindo' : 'Seguir'}
      </EditButton>
    )}
  </LikeUserItem>
);

export default UserListItem;
