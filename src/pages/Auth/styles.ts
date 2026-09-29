import styled from 'styled-components';
import { Twitter, ArrowLeft, Person } from '../../styles/Icons';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--primary);
  padding: 20px;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 440px;
  margin-bottom: 20px;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: var(--secondary);
  }
`;

export const BackIcon = styled(ArrowLeft)`
  width: 24px;
  height: 24px;
  color: var(--white);
`;

export const TwitterLogo = styled(Twitter)`
  width: 32px;
  height: 32px;
  color: var(--twitter);
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 440px;
`;

export const Title = styled.h1`
  font-size: 26px;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 8px;
`;

export const SubTitle = styled.p`
  font-size: 14px;
  color: var(--gray);
  margin-bottom: 24px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 20px;
`;

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
`;

export const FloatingInputBox = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--outline);
  border-radius: 4px;
  padding: 8px 12px;
  background: var(--primary);
  transition: border-color 0.2s;

  &:focus-within {
    border-color: var(--twitter);

    label {
      color: var(--twitter);
    }
  }

  label {
    font-size: 12px;
    color: var(--gray);
    margin-bottom: 2px;
  }

  input {
    background: none;
    border: none;
    color: var(--white);
    font-size: 16px;
    outline: none;

    &[type='date']::-webkit-calendar-picker-indicator {
      filter: invert(1);
      cursor: pointer;
    }
  }
`;

export const CharCounter = styled.span`
  align-self: flex-end;
  font-size: 12px;
  color: var(--gray);
  margin-top: 4px;
`;

export const UploadBox = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 180px;
  margin: 30px auto;
  border: 2px dashed var(--twitter);
  border-radius: 16px;
  cursor: pointer;
  background: var(--secondary);
  position: relative;
  overflow: hidden;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(1.1);
  }

  input {
    display: none;
  }

  span {
    color: var(--twitter);
    font-weight: 600;
    font-size: 15px;
    margin-top: 10px;
  }
`;

export const UploadIcon = styled(Person)`
  width: 48px;
  height: 48px;
  color: var(--twitter);
`;

export const AvatarPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const FooterActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 40px;
  gap: 16px;
`;

export const NextButton = styled.button`
  width: 100%;
  background: var(--white);
  color: var(--primary);
  font-weight: 700;
  font-size: 15px;
  padding: 12px 24px;
  border-radius: 9999px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SkipButton = styled.button`
  background: transparent;
  border: 1px solid var(--outline);
  color: var(--white);
  font-weight: 700;
  font-size: 15px;
  padding: 12px 24px;
  border-radius: 9999px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--secondary);
  }
`;

export const FooterLinks = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  font-size: 14px;

  span {
    color: var(--twitter);
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .dot {
    color: var(--gray);
    cursor: default;
  }
`;

export const ErrorMessage = styled.div`
  background: rgba(232, 38, 94, 0.1);
  border: 1px solid var(--like);
  color: var(--like);
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  width: 100%;
  margin-bottom: 16px;
`;
