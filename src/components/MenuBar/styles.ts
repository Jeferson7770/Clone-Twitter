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
  LightMode,
  DarkMode,
} from '../../styles/Icons';

export const Container = styled.div`
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 99;
  background: var(--primary);
  border-top: 1px solid var(--outline);
  width: 100%;
  padding: 8px 0;
  justify-content: space-around;
  align-items: center;

  @media (min-width: 500px) {
    position: sticky;
    top: 0;
    left: 0;
    z-index: initial;
    width: auto;
    background: transparent;
    border-top: none;

    padding: 9px 19px 20px;
    flex-direction: column;
    justify-content: space-between;
    max-height: 100vh;
    overflow-y: auto;
  }
`;

export const Topside = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 100%;

  @media (min-width: 500px) {
    flex-direction: column;
    align-items: center;
    width: auto;

    @media (min-width: 1280px) {
      align-items: flex-start;
    }
  }
`;

export const Logo = styled(Twitter)`
  display: none;

  @media (min-width: 500px) {
    display: block;
    width: 41px;
    height: 41px;
    margin-bottom: 20px;

    > path {
      fill: var(--twitter);
    }
  }
`;

export const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--white);
  padding: 8px;
  outline: 0;
  cursor: pointer;
  border-radius: 25px;
  transition: background 0.2s;

  > span {
    display: none;
  }

  &.mobile-hide {
    display: none;

    @media (min-width: 500px) {
      display: flex;
    }
  }

  & + button {
    margin-top: 0;

    @media (min-width: 500px) {
      margin-top: 16.5px;
    }
  }

  @media (min-width: 1280px) {
    padding-right: 15px;

    > span {
      display: inline;
      margin-left: 19px;
      font-size: 19px;
    }
  }

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
export const ThemeLightIcon = styled(LightMode)`
  ${iconCSS}
`;
export const ThemeDarkIcon = styled(DarkMode)`
  ${iconCSS}
`;

export const ThemeIconWrapper = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

export const TweetButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 65px;
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--twitter);
  color: var(--white);
  border: none;
  cursor: pointer;
  outline: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  z-index: 100;
  transition:
    opacity 0.2s,
    transform 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.95);
  }

  > span {
    display: none;
  }

  @media (min-width: 500px) {
    position: static;
    margin-top: 24px;
    width: 50px;
    height: 50px;
    box-shadow: none;
    z-index: initial;
  }

  @media (min-width: 1280px) {
    width: 100%;
    height: 52px;
    border-radius: 9999px;
    padding: 0 16px;

    > span {
      display: inline-block;
      width: 100%;
      text-align: center;
      font-size: 17px;
      font-weight: bold;
      color: var(--white);
    }
  }
`;

export const TweetIcon = styled.svg`
  width: 24px;
  height: 24px;
  fill: var(--white);

  @media (min-width: 1280px) {
    display: none;
  }
`;

export const Botside = styled.div`
  display: none;
  cursor: pointer;

  @media (min-width: 500px) {
    display: flex;
    margin-top: 20px;
    align-items: center;
  }
`;

export const Avatar = styled.div<{ $avatarUrl?: string }>`
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: var(--gray);

  ${(props) =>
    props.$avatarUrl &&
    css`
      background-image: url(${props.$avatarUrl});
      background-size: cover;
      background-position: center;
    `}
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
