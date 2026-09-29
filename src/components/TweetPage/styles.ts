import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  max-width: 600px;
  border-right: 1px solid var(--outline);
  border-left: 1px solid var(--outline);
  min-height: 100vh;
`;

export const MessageContainer = styled.div<{ $center?: boolean }>`
  padding: 20px;
  color: var(--white);
  text-align: ${(props) => (props.$center ? 'center' : 'left')};
`;

export const BackButtonText = styled.button`
  margin-bottom: 20px;
  cursor: pointer;
  background: none;
  border: none;
  color: var(--twitter);
  font-size: 15px;

  &:hover {
    text-decoration: underline;
  }
`;

export const ErrorText = styled.h3`
  color: var(--like);
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid var(--outline);
  color: var(--white);
  position: sticky;
  top: 0;
  background-color: var(--primary);
  z-index: 2;
`;

export const HeaderBackButton = styled.button`
  background: none;
  border: none;
  color: var(--white);
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;

  &:hover {
    opacity: 0.8;
  }
`;

export const HeaderTitle = styled.h2`
  font-size: 20px;
  margin: 0;
`;
