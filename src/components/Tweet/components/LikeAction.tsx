import type { MouseEvent } from 'react';
import { LikeIcon, Status } from '../styles';

interface LikeActionProps {
  count: number;
  isLiked: boolean;
  onLike: (e: MouseEvent) => void;
  onOpenLikes: (e: MouseEvent) => void;
}

/** Coração + contador. Clicar no coração curte; clicar no número abre a lista. */
const LikeAction = ({ count, isLiked, onLike, onOpenLikes }: LikeActionProps) => (
  <Status className={isLiked ? 'active-like' : ''} $isLiked={isLiked}>
    <LikeIcon onClick={onLike} $isLiked={isLiked} />
    <span
      onClick={onOpenLikes}
      className="clickable-likes"
      title="Ver quem curtiu"
      style={{ color: isLiked ? '#f91880' : 'inherit' }}
    >
      {count}
    </span>
  </Status>
);

export default LikeAction;
