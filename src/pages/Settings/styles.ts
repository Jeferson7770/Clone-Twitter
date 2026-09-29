import styled from 'styled-components';
import { ArrowLeft } from '../../styles/Icons';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const Header = styled.div`
  z-index: 2;
  position: sticky;
  top: 0;
  background: var(--primary);
  display: flex;
  align-items: center;
  text-align: left;
  padding: 8px 0 9px 13px;
  border-bottom: 1px solid var(--outline);

  > button {
    padding: 8px;
    border-radius: 50%;
    outline: 0;
    cursor: pointer;
    background: transparent;
    border: none;

    &:hover {
      background: var(--twitter-dark-hover);
    }
  }

  > h2 {
    margin-left: 17px;
    font-size: 19px;
    font-weight: bold;
    color: var(--white);
  }
`;

export const BackIcon = styled(ArrowLeft)`
  width: 24px;
  height: 24px;
  fill: var(--twitter);
`;

export const Content = styled.div`
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Title = styled.h1`
  font-size: 22px;
  font-weight: bold;
  color: var(--white);
`;

export const Description = styled.p`
  font-size: 15px;
  color: var(--gray);
  line-height: 1.5;
  margin-bottom: 8px;
`;

export const SafeMessage = styled.p`
  font-size: 14px;
  color: var(--twitter);
  margin-bottom: 24px;
  line-height: 1.5;
  background-color: rgba(51, 161, 242, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
`;

export const DeleteButton = styled.button`
  background-color: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
  border-radius: 20px;
  padding: 12px 32px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  align-self: center;

  &:hover {
    background-color: rgba(232, 38, 94, 0.1);
  }
`;

export const ConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: var(--primary);
  width: 90%;
  max-width: 320px;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0px 0px 15px rgba(217, 217, 217, 0.1); 

  h3 {
    color: var(--white);
    font-size: 20px;
    margin-bottom: 8px;
  }

  p {
    color: var(--gray);
    font-size: 14px;
    margin-bottom: 24px;
  }
`;

export const ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ConfirmButton = styled.button`
  background: var(--danger);
  color: var(--white);
  border: none;
  border-radius: 20px;
  padding: 12px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  transition:
    opacity 0.2s,
    filter 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    filter: brightness(
      0.85
    ); 
  }
`;

export const CancelButton = styled.button`
  background: transparent;
  color: var(--white);
  border: 1px solid var(--outline);
  border-radius: 20px;
  padding: 12px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: var(--twitter-dark-hover);
  }
`;
