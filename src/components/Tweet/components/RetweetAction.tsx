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
  hasQuoted?: boolean;
  isMenuOpen: boolean;
  onToggleMenu: (e: MouseEvent) => void;
  onRetweet: (e: MouseEvent) => void;
  onQuote: (e: MouseEvent) => void;
  onOpenRetweetedBy: (e: MouseEvent) => void;
}

const RetweetAction = ({
  menuRef,
  count,
  isRetweeted,
  hasQuoted = false,
  isMenuOpen,
  onToggleMenu,
  onRetweet,
  onQuote,
  onOpenRetweetedBy,
}: RetweetActionProps) => {
  const hasInteracted = isRetweeted || hasQuoted;

  const handleRetweetClick = (e: MouseEvent) => {
    if (hasQuoted) {
      alert('Você já fez um retweet com comentário nesta postagem.');
      return;
    }
    onRetweet(e);
  };

  const handleQuoteClick = (e: MouseEvent) => {
    if (isRetweeted) {
      alert(
        'Você já fez um retweet simples. Desfaça o retweet primeiro para poder comentar.'
      );
      return;
    }
    if (hasQuoted) {
      alert('Você já fez um retweet com comentário nesta postagem.');
      return;
    }
    onQuote(e);
  };

  return (
    <RetweetWrapper ref={menuRef}>
      <Status
        onClick={onToggleMenu}
        className={hasInteracted ? 'active-retweet' : ''}
        $isRetweeted={hasInteracted}
      >
        <RetweetIcon $isRetweeted={hasInteracted} />
        <RetweetCountSpan
          onClick={(e) => {
            if (count > 0) {
              e.stopPropagation();
              onOpenRetweetedBy(e);
            }
          }}
          title="Ver quem retuitou"
          style={{ color: hasInteracted ? 'var(--retweet)' : 'inherit' }}
        >
          {count}
        </RetweetCountSpan>
      </Status>

      {isMenuOpen && (
        <RetweetDropdown>
          <DropdownItem onClick={handleRetweetClick}>
            {isRetweeted
              ? 'Desfazer Retweet'
              : hasQuoted
                ? 'Já comentado no retweet'
                : 'Retweetar'}
          </DropdownItem>

          <DropdownItem onClick={handleQuoteClick}>
            {hasQuoted
              ? 'Você já comentou no retweet'
              : isRetweeted
                ? 'Já retuitado'
                : 'Comentar no Retweet'}
          </DropdownItem>
        </RetweetDropdown>
      )}
    </RetweetWrapper>
  );
};

export default RetweetAction;
