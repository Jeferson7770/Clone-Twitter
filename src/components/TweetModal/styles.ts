import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(91, 112, 131, 0.4);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 50px;
  z-index: 9999;
`;

export const ModalContainer = styled.div`
  background-color: var(--primary);
  width: 100%;
  max-width: 600px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--outline);
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--outline);
`;

export const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--white);
  font-size: 18px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(239, 243, 244, 0.1);
  }
`;

export const Body = styled.div`
  display: flex;
  padding: 16px;
  gap: 12px;
`;

export const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--gray);
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const TextArea = styled.textarea`
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--white);
  font-size: 20px;
  font-family: inherit;
  resize: none;
  padding: 8px 0;

  &::placeholder {
    color: var(--gray);
  }
`;

export const ImagePreviewContainer = styled.div`
  position: relative;
  margin-top: 12px;
  margin-bottom: 12px;
  border-radius: 16px;
  overflow: hidden;
  max-height: 320px;
  border: 1px solid var(--outline);
  background-color: var(--primary);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  max-height: 320px;
  object-fit: contain;
  display: block;
`;

export const VideoPreview = styled.video`
  width: 100%;
  max-height: 320px;
  object-fit: contain;
  display: block;
  border-radius: 16px;
`;

export const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(15, 20, 25, 0.75);
  color: var(--white);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(39, 44, 48, 0.9);
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--outline);
  margin-top: 12px;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const UploadImageLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--twitter);
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(29, 155, 240, 0.1);
  }

  input {
    display: none;
  }
`;

export const ImageIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`;

export const EmojiPickerPopover = styled.div`
  position: absolute;
  bottom: 45px;
  left: 0;
  background-color: var(--primary);
  border: 1px solid var(--outline);
  box-shadow:
    rgba(255, 255, 255, 0.2) 0px 0px 15px,
    rgba(255, 255, 255, 0.05) 0px 0px 3px 1px;
  padding: 8px;
  border-radius: 12px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  z-index: 20;
  width: 180px;

  span {
    font-size: 20px;
    text-align: center;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(239, 243, 244, 0.1);
    }
  }
`;

export const TweetButton = styled.button`
  background-color: var(--twitter);
  color: var(--white);
  border: none;
  border-radius: 9999px;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--twitter-light-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const CharCounter = styled.span<{ $isWarning?: boolean }>`
  font-size: 13px;
  color: ${(props) => (props.$isWarning ? 'var(--like)' : 'var(--gray)')};
`;
