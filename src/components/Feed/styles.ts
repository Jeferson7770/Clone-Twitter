// styles.ts
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--primary, #000000);
  border-bottom: 1px solid var(--outline);
`;

export const Tab = styled.div`
  margin-top: 10px;
  padding: 11px 0 15px;
  text-align: center;
  font-weight: bold;
  font-size: 15px;
  outline: 0;
  cursor: pointer;
  color: var(--twitter);

  &:hover {
    background: var(--twitter-dark-hover);
  }
`;

export const SortToggle = styled.div`
  display: flex;
  width: 100%;

  button {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 15px 0;
    font-weight: bold;
    font-size: 15px;
    color: var(--gray);
    cursor: pointer;
    transition: 0.2s;
    border-bottom: 2px solid transparent;

    &:hover {
      background: var(--twitter-dark-hover);
    }

    &.active {
      color: var(--twitter);
      border-bottom: 2px solid var(--twitter);
    }
  }
`;

export const TweetBoxContainer = styled.div`
  display: flex;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--outline);
  background: var(--primary, #000000);
`;

export const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
  background-color: var(--gray);
`;

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
`;

export const TweetInput = styled.textarea`
  width: 100%;
  border: none;
  background: transparent;
  font-size: 18px;
  color: var(--white, #fff);
  outline: none;
  resize: none;
  margin-top: 8px;
  margin-bottom: 10px;
  min-height: 40px;
  font-family: inherit;

  &::placeholder {
    color: var(--gray);
  }
`;

export const ImagePreviewContainer = styled.div`
  position: relative;
  margin-bottom: 12px;
  max-height: 250px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--outline);
`;

export const PreviewImage = styled.img`
  width: 100%;
  max-height: 250px;
  object-fit: cover;
  display: block;
`;

export const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

export const ActionArea = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--outline);
`;

export const IconsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  svg {
    width: 20px;
    height: 20px;
    fill: var(--twitter);
    cursor: pointer;
    transition: 0.2s;

    &:hover {
      opacity: 0.8;
      background: rgba(29, 155, 240, 0.1);
      border-radius: 50%;
    }
  }
`;

export const EmojiPickerPopover = styled.div`
  position: absolute;
  bottom: 45px;
  left: 0;
  background: var(--primary);
  border: 1px solid var(--outline);
  border-radius: 12px;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  span {
    font-size: 20px;
    cursor: pointer;
    padding: 6px;
    text-align: center;
    border-radius: 8px;
    transition: 0.2s;

    &:hover {
      background: var(--search);
    }
  }
`;

export const PostButton = styled.button`
  background: var(--twitter);
  color: #fff;
  font-weight: bold;
  font-size: 15px;
  border: none;
  border-radius: 9999px;
  padding: 8px 16px;
  cursor: pointer;
  transition: 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  &:not(:disabled):hover {
    background: var(--twitter-light-hover, #1a8cd8);
  }
`;

export const Tweets = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

export const Message = styled.div`
  padding: 20px;
  text-align: center;
  color: var(--gray);
`;
