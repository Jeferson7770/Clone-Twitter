import type { MouseEvent, RefObject } from 'react';
import {
  DropdownItem,
  RetweetCountSpan,
  RetweetDropdown,
  RetweetIcon,
  RetweetWrapper,
  Status,
} from '../styles';

interface RetweetActionProps {
  menuRef: RefObject<HTMLDivElement | null>;
  count: number;
  isRetweeted: boolean;
  isMenuOpen: boolean;
  onToggleMenu: (e: MouseEvent) => void;
  onRetweet: (e: MouseEvent) => void;
  onQuote: (e: MouseEvent) => void;
  onOpenRetweetedBy: (e: MouseEvent) => void;
}

/** Ícone de retweet + contador + dropdown (Retweetar / Comentar no Retweet). */
const RetweetAction = ({
  menuRef,
  count,
  isRetweeted,
  isMenuOpen,
  onToggleMenu,
  onRetweet,
  onQuote,
  onOpenRetweetedBy,
}: RetweetActionProps) => (
  <RetweetWrapper ref={menuRef}>
    <Status
      onClick={onToggleMenu}
      className={isRetweeted ? 'active-retweet' : ''}
      $isRetweeted={isRetweeted}
    >
      <RetweetIcon />
      <RetweetCountSpan
        onClick={onOpenRetweetedBy}
        title="Ver quem retuitou"
        style={{ color: isRetweeted ? '#00ba7c' : 'inherit' }}
      >
        {count}
      </RetweetCountSpan>
    </Status>

    {isMenuOpen && (
      <RetweetDropdown>
        <DropdownItem onClick={onRetweet}>
          {isRetweeted ? 'Desfazer Retweet' : 'Retweetar'}
        </DropdownItem>
        <DropdownItem onClick={onQuote}>Comentar no Retweet</DropdownItem>
      </RetweetDropdown>
    )}
  </RetweetWrapper>
);

export default RetweetAction;
