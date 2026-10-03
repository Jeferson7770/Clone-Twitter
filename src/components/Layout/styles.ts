import styled from 'styled-components';

interface MainProps {
  $isMessagesPage?: boolean;
}

export const Container = styled.div`
  background: var(--primary, #000000);
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
`;

export const Wrapper = styled.div`
  width: 100%;
  max-width: 1280px;
  min-height: 100vh;
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
`;

export const Main = styled.div<MainProps>`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${(props) => (props.$isMessagesPage ? '990px' : '601px')};
  min-height: 100vh;

  @media (min-width: 500px) {
    border-left: 1px solid var(--outline, #2f3336);
    border-right: 1px solid var(--outline, #2f3336);
  }
`;
