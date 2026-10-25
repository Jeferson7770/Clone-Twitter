import type { MouseEvent } from 'react';
import {
  DeleteButton,
  Dot,
  Header,
  HeaderInfo,
  TrashIconSpan,
} from '../styles';
import type { ITweetData } from '../types';

interface TweetHeaderProps {
  author: ITweetData['author'];
  formattedDate: string;
  isOwner: boolean;
  isDeleting: boolean;
  onUserClick: (e: MouseEvent, username: string) => void;
  onDeleteClick: (e: MouseEvent) => void;
}

/** Nome, @usuário, data e botão de excluir (só para o dono). */
const TweetHeader = ({
  author,
  formattedDate,
  isOwner,
  isDeleting,
  onUserClick,
  onDeleteClick,
}: TweetHeaderProps) => (
  <Header>
    <HeaderInfo onClick={(e) => onUserClick(e, author.username)}>
      <strong>{author.first_name || author.username}</strong>
      <span>@{author.username}</span>
      <Dot />
      <time>{formattedDate}</time>
    </HeaderInfo>

    {isOwner && (
      <DeleteButton
        onClick={onDeleteClick}
        title="Deletar tweet"
        disabled={isDeleting}
      >
        {isDeleting ? '⏳' : <TrashIconSpan>🗑️</TrashIconSpan>}
      </DeleteButton>
    )}
  </Header>
);

export default TweetHeader;
