import styled from 'styled-components';
import { Search } from '../../styles/Icons';

export const Container = styled.div`
  display: none;

  @media (min-width: 1000px) {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 350px; 

    height: 100vh;
    position: sticky;
    top: 0;
    overflow-y: auto;

    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const SearchWrapper = styled.div`
  padding: 10px 16px;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--primary);
  max-height: 57px;
`;

export const SearchInput = styled.input`
  width: 100%;
  height: 39px;
  font-size: 14px;
  padding: 0 14px 0 52px;
  border-radius: 19.5px;
  background: var(--search);
  color: var(--white);
  outline: 0;

  &::placeholder {
    color: var(--gray);
  }

  ~ svg {
    position: relative;
    top: -33px;
    left: 15px;
    z-index: 1;
    transition: 180ms ease-in-out;
  }

  &:focus {
    border: 1px solid var(--twitter);

    ~ svg {
      fill: var(--twitter);
    }
  }
`;

export const SearchIcon = styled(Search)`
  width: 20px;
  height: 20px;
  fill: var(--gray);
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 16px 200px;
  margin-top: 3px;
  width: 100%;

  > div + div {
    margin-top: 15px;
  }
`;

export const HashtagDropdown = styled.div`
  position: absolute;
  top: 52px;
  left: 16px;
  width: calc(100% - 32px);
  background-color: var(--primary);
  border: 1px solid var(--outline);
  border-radius: 12px;
  z-index: 10;
  overflow: hidden;
  box-shadow: 0px 4px 12px rgba(255, 255, 255, 0.1);
`;

export const HashtagItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--outline);
  color: var(--white);
  font-weight: bold;
  font-size: 14px;

  &:hover {
    background: var(--search);
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const StatusMessage = styled.span`
  display: block;
  padding: 12px 16px;
  color: var(--gray);
  font-size: 14px;
`;
