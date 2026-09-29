import styled from 'styled-components';

export const Container = styled.div`
  background: var(--primary);
`;

export const Wrapper = styled.div`
  height: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
`;

export const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (min-width: 500px) {
    max-width: 600px;
    border-left: 1px solid var(--outline);
    border-right: 1px solid var(--outline);
  }
`;

export const Header = styled.div`
  z-index: 2;
  position: sticky;
  top: 0;
  background: var(--primary);
  display: flex;
  align-items: center;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid var(--outline);

  h2 {
    font-size: 19px;
    font-weight: bold;
    color: var(--white);
    margin: 0;
  }
`;
