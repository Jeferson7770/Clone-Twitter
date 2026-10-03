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
  background: var(
    --primary,
    #000000
  ); 
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
