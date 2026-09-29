import styled from 'styled-components';

export const Container = styled.div`
  background: var(--primary, #000000);
  min-height: 100vh;
`;

export const Wrapper = styled.div`
  height: 100vh;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
`;

interface MainProps {
  $isMessagesPage?: boolean;
}

export const Main = styled.div<MainProps>`
  display: flex;
  flex-direction: column;
  height: 100%;

  width: 100%;
  max-width: ${(props) => (props.$isMessagesPage ? '990px' : '601px')};

  @media (min-width: 500px) {
    border-left: 1px solid var(--outline, #2f3336);
    border-right: 1px solid var(--outline, #2f3336);
  }
`;
