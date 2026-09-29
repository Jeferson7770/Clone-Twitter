import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--primary);
`;

export const ModalContent = styled.div`
  width: 100%;
  max-width: 450px;
  padding: 32px;
  display: flex;
  flex-direction: column;

  @media (max-width: 500px) {
    padding: 20px;
  }
`;

export const LogoWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 32px;

  svg {
    width: 40px;
    height: 40px;
    fill: var(--white);
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h1`
  font-size: 31px;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 8px;
  line-height: 36px;
`;

export const SubTitle = styled.p`
  font-size: 15px;
  color: var(--gray);
  margin-bottom: 24px;
  line-height: 20px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

export const InputWrapper = styled.div`
  width: 100%;
`;

export const FloatingInputBox = styled.div`
  position: relative;
  width: 100%;
  border: 1px solid var(--outline);
  border-radius: 4px;
  background-color: transparent;
  transition: all 0.2s ease-in-out;

  &:focus-within {
    border-color: var(--twitter);
    box-shadow: 0 0 0 1px var(--twitter);
  }

  input {
    width: 100%;
    padding: 26px 8px 8px 8px; 
    border: none;
    outline: none;
    background: transparent;
    font-size: 17px;
    color: var(--white);
  }

  label {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 17px;
    color: var(--gray);
    transition: all 0.2s ease-in-out;
    pointer-events: none;
  }

  input:focus + label,
  input:not(:placeholder-shown) + label {
    top: 14px;
    font-size: 13px;
    color: var(--twitter);
  }

  input:not(:focus):not(:placeholder-shown) + label {
    color: var(--gray);
  }
`;

export const NextButton = styled.button`
  background-color: var(--white);
  color: var(--primary);
  border: none;
  border-radius: 9999px;
  padding: 0 32px;
  height: 52px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  width: 100%;

  &:hover {
    filter: brightness(0.9);
  }

  &:disabled {
    background-color: var(--outline);
    color: var(--gray);
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  background-color: rgba(
    232,
    38,
    94,
    0.1
  ); 
  color: var(--like);
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
`;
