import styled, { css } from 'styled-components';

import {
  Home,
  Notifications,
  Email,
  FavoriteBorder,
  Person,
  ExitToApp,
  Twitter,
  Settings,
  LightMode, // Novo ícone importado
  DarkMode, // Novo ícone importado
} from '../../styles/Icons';

export const Container = styled.div`
  display: none;

  @media (min-width: 500px) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    position: sticky;
    top: 0;
    left: 0;

    padding: 9px 19px 20px;

    max-height: 100vh;
    overflow-y: auto;
  }
`;

export const Topside = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 1280px) {
    align-items: flex-start;
  }
`;

export const Logo = styled(Twitter)`
  width: 41px;
  height: 41px;

  > path {
    fill: var(--twitter);
  }

  margin-bottom: 20px;
`;

export const MenuButton = styled.button`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--white);

  > span {
    display: none;
  }

  @media (min-width: 1280px) {
    > span {
      display: inline;
      margin-left: 19px;
      font-size: 19px;
    }

    padding-right: 15px;
  }

  padding: 8.25px 0;
  outline: 0;

  & + button {
    margin-top: 16.5px;
  }

  & + button:last-child {
    margin-top: 33px;

    width: 40px;
    height: 40px;

    > span {
      display: none;
    }

    @media (min-width: 1280px) {
      width: 100%;
      height: unset;

      > span {
        display: inline;
      }
    }
  }

  cursor: pointer;
  border-radius: 25px;
  transition: background 0.2s;

  &:hover {
    background: var(--twitter-dark-hover);
  }

  &:hover,
  &.active {
    span,
    svg,
    svg path {
      color: var(--twitter);
      fill: var(--twitter);
    }
  }

  &.active {
    span {
      font-weight: bold;
    }
  }
`;

const iconCSS = css`
  flex-shrink: 0;

  width: 30px;
  height: 30px;
  color: var(--white);
`;

export const HomeIcon = styled(Home)`
  ${iconCSS}
`;
export const BellIcon = styled(Notifications)`
  ${iconCSS}
`;
export const EmailIcon = styled(Email)`
  ${iconCSS}
`;
export const FavoriteIcon = styled(FavoriteBorder)`
  ${iconCSS}
`;
export const ProfileIcon = styled(Person)`
  ${iconCSS}
`;
export const SettingsIcon = styled(Settings)`
  ${iconCSS}
`;

// Novos ícones de tema adicionados aqui
export const ThemeLightIcon = styled(LightMode)`
  ${iconCSS}
`;
export const ThemeDarkIcon = styled(DarkMode)`
  ${iconCSS}
`;

export const Botside = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
`;

export const Avatar = styled.div`
  width: 39px;
  height: 39px;

  flex-shrink: 0;
  border-radius: 50%;
  background: var(--gray);
`;

export const ProfileData = styled.div`
  display: none;

  @media (min-width: 1280px) {
    display: flex;
    flex-direction: column;

    margin-left: 10px;
    font-size: 14px;

    > span {
      color: var(--gray);
    }
  }
`;

export const ExitIcon = styled(ExitToApp)`
  display: none;

  @media (min-width: 1280px) {
    display: inline-block;
    width: 25px;
    height: 25px;
    color: var(--white);
    margin-left: 30px;
    cursor: pointer;

    &:hover {
      > path {
        color: var(--like);
      }
    }
  }
`;

export const IconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const NotificationBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background-color: var(--twitter);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  border: 2px solid var(--primary);
  z-index: 2;
  pointer-events: none;
`;

export const ModalOverlay = styled.div<{ $zIndex?: number }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${(props) => props.$zIndex || 1100};
`;

export const ModalBody = styled.div`
  background-color: var(--primary);
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
  text-align: center;

  h2 {
    font-size: 20px;
    margin-bottom: 8px;
    color: var(--white);
  }

  p {
    font-size: 14px;
    color: var(--gray);
    margin-bottom: 24px;
    line-height: 1.4;
  }
`;

export const ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const DeleteButton = styled.button`
  width: 100%;
  background-color: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
  border-radius: 20px;
  padding: 12px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(244, 33, 46, 0.1);
  }
`;

export const ConfirmDeleteButton = styled.button`
  background-color: var(--danger);
  color: var(--white);
  border: none;
  border-radius: 20px;
  padding: 12px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  transition:
    opacity 0.2s,
    background-color 0.2s;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:hover:not(:disabled) {
    background-color: var(--danger-hover);
  }
`;

export const CancelButton = styled.button`
  background-color: transparent;
  color: var(--white);
  border: 1px solid var(--outline);
  border-radius: 20px;
  padding: 12px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;
