import { useCallback, useRef, useState } from 'react';
import { useClickOutside } from './useClickOutside';

export type TweetMenu = 'comment' | 'retweet';

/**
 * Controla os dropdowns da barra de ações (comentar / retweetar).
 * Só um fica aberto por vez e ambos fecham ao clicar fora.
 */
export function useTweetMenus() {
  const [openMenu, setOpenMenu] = useState<TweetMenu | null>(null);

  const commentMenuRef = useRef<HTMLDivElement>(null);
  const retweetMenuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setOpenMenu(null), []);
  const toggleMenu = useCallback(
    (menu: TweetMenu) =>
      setOpenMenu((current) => (current === menu ? null : menu)),
    []
  );

  useClickOutside([commentMenuRef], closeMenu, openMenu === 'comment');
  useClickOutside([retweetMenuRef], closeMenu, openMenu === 'retweet');

  return { openMenu, toggleMenu, closeMenu, commentMenuRef, retweetMenuRef };
}
