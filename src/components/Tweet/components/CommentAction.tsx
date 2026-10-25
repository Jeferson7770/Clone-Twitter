import type { MouseEvent, RefObject } from 'react';
import {
  CommentIcon,
  DropdownItem,
  RetweetDropdown,
  RetweetWrapper,
  Status,
} from '../styles';

interface CommentActionProps {
  menuRef: RefObject<HTMLDivElement | null>;
  count: number;
  isMenuOpen: boolean;
  onToggleMenu: (e: MouseEvent) => void;
  onReply: (e: MouseEvent) => void;
  onViewAll: (e: MouseEvent) => void;
}

/** Ícone de comentário + contador + dropdown (Responder / Ver todas). */
const CommentAction = ({
  menuRef,
  count,
  isMenuOpen,
  onToggleMenu,
  onReply,
  onViewAll,
}: CommentActionProps) => (
  <RetweetWrapper ref={menuRef}>
    <Status onClick={onToggleMenu}>
      <CommentIcon />
      <span title="Opções de resposta">{count}</span>
    </Status>

    {isMenuOpen && (
      <RetweetDropdown>
        <DropdownItem onClick={onReply}>Responder</DropdownItem>
        <DropdownItem onClick={onViewAll}>Ver todas as respostas</DropdownItem>
      </RetweetDropdown>
    )}
  </RetweetWrapper>
);

export default CommentAction;
