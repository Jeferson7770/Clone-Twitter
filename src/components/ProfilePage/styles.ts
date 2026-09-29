import styled, { css } from 'styled-components';
import { LocationOn, Cake, ArrowLeft } from '../../styles/Icons';
import Button from '../Button';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
`;


export const Header = styled.div`
  z-index: 2;
  position: sticky;
  top: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  text-align: left;
  padding: 8px 0 9px 13px;
  border-bottom: 1px solid var(--outline);
`;

export const BackIcon = styled(ArrowLeft)`
  width: 24px;
  height: 24px;
  fill: var(--twitter);
  margin-right: 15px;
  padding: 4px; 

  &:hover {
    background: var(--twitter-dark-hover);
    border-radius: 50%;
  }
`;

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;

  > strong {
    font-size: 19px;
    color: var(--white);
  }

  > span {
    font-size: 15px;
    color: var(--gray);
  }
`;


export const Banner = styled.div`
  flex-shrink: 0;
  width: 100%;
  height: min(33vw, 199px);
  background: var(--twitter);
  position: relative;
`;

export const Avatar = styled.div`
  width: max(45px, min(135px, 22vw));
  height: max(45px, min(135px, 22vw));
  border: 3.75px solid var(--primary);
  background: var(--gray);
  border-radius: 50%;
  position: absolute;
  bottom: max(-60px, -10vw);
  left: 15px;
`;

export const ProfileData = styled.div`
  padding: min(calc(10vw + 7px), 67px) 16px 0;
  display: flex;
  flex-direction: column;
  position: relative;

  > h1 {
    font-weight: bold;
    font-size: 19px;
    color: var(--white);
  }

  > h2 {
    font-weight: normal;
    font-size: 15px;
    color: var(--gray);
  }

  > p {
    font-size: 15px;
    margin-top: 11px;
    color: var(--white);

    > a {
      text-decoration: none;
      color: var(--twitter);
    }
  }

  > ul {
    list-style: none;
    margin-top: 10px;
    margin-bottom: 10px;

    > li {
      font-size: 15px;
      color: var(--gray);
      display: flex;
      align-items: center;

      > svg {
        fill: var(--white);
        color: var(--white);
        margin-right: 5px;
      }
    }
  }
`;

const iconCSS = css`
  width: 20px;
  height: 20px;
  color: var(--white);
  fill: var(--white);
`;

export const LocationIcon = styled(LocationOn)`
  ${iconCSS}
`;

export const CakeIcon = styled(Cake)`
  ${iconCSS}
`;

export const Followage = styled.div`
  display: flex;

  > span {
    font-size: 15px;
    color: var(--gray);

    strong {
      color: var(--white);
    }

    & + span {
      margin-left: 20px;
    }
  }
`;

export const EditButton = styled(Button)<{ $outlined?: boolean }>`
  position: absolute;
  top: 2vw;
  right: 7px;
  padding: 4px 16px;
  font-size: 13px;

  background: ${(props) =>
    props.$outlined ? 'transparent' : 'var(--twitter)'};
  color: ${(props) => (props.$outlined ? 'var(--twitter)' : 'var(--white)')};
  border: ${(props) => (props.$outlined ? '1px solid var(--twitter)' : 'none')};

  &:hover {
    background: ${(props) =>
      props.$outlined
        ? 'rgba(29, 161, 242, 0.1)'
        : 'var(--twitter-dark-hover, #1a91da)'};
  }

  @media (min-width: 320px) {
    top: 10px;
    padding: 10px 19px;
    font-size: 15px;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(91, 112, 131, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background-color: var(--secondary);
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  color: var(--white);
  box-shadow: rgba(255, 255, 255, 0.2) 0px 0px 15px;
  overflow: hidden;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--outline);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    h2 {
      font-size: 20px;
      font-weight: bold;
      color: var(--white);
    }
  }
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: var(--white);
  font-size: 18px;
  cursor: pointer;
`;

export const ModalSaveButton = styled.button`
  background-color: var(--twitter);
  color: var(--white);
  border: none;
  border-radius: 20px;
  padding: 8px 18px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;

  &:hover {
    background-color: var(--twitter-light-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ModalBody = styled.form`
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const AvatarUploadContainer = styled.div`
  position: relative;
  height: 100px;
  margin-bottom: 40px;

  input {
    display: none;
  }
`;

export const BannerPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background-color: var(--outline);
`;

export const AvatarUploadButton = styled.div`
  position: absolute;
  top: 50px;
  left: 16px;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  border: 4px solid var(--secondary);
  background-color: var(--gray);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  .camera-wrapper {
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export const CameraIcon = styled.span`
  &::after {
    content: '📷';
    font-size: 16px;
  }
`;

export const InputGroup = styled.div`
  border: 1px solid var(--outline);
  border-radius: 4px;
  padding: 8px 12px;
  background-color: var(--search);

  label {
    font-size: 13px;
    color: var(--gray);
    display: block;
  }

  input,
  textarea {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--white);
    font-size: 16px;
    outline: none;
    margin-top: 4px;
  }

  input[type='date'] {
    color-scheme: dark;
  }

  textarea {
    resize: none;
    height: 60px;
  }
`;

export const AvatarModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

export const AvatarModalContent = styled.div`
  position: relative;
  max-width: 750px;
  width: 100%;
  max-height: 82vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AvatarModalCloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: var(--white);
  border-radius: 50%;
  width: 38px;
  height: 38px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

export const AvatarModalImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 82vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: block;
  background-color: var(--secondary);
`;
