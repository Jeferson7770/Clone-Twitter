import styled from 'styled-components';
import { Search } from '../../styles/Icons';

export const Container = styled.div`
  display: none;

  @media (min-width: 1000px) {
    display: flex;
    flex-direction: column;
    width: min(399px, 100%);

    /* Ocupa a altura total do ecrã e fixa a barra lateral */
    height: 100vh;
    position: sticky;
    top: 0;
    overflow-y: auto;

    /* Oculta a barra de deslocamento para um visual mais limpo */
    scrollbar-width: none; /* Firefox */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari e Opera */
    }
  }
`;

export const SearchWrapper = styled.div`
  padding: 10px 24px;
  width: min(399px, 100%);
  position: sticky; /* Mantém a pesquisa fixa no topo da barra lateral */
  top: 0;
  z-index: 2;
  background: var(--primary);
  max-height: 57px;
`;

export const SearchInput = styled.input`
  width: 100%;
  height: 39px;
  font-size: 14px;
  padding: 0 10px 0 52px;
  border-radius: 19.5px;
  background: var(--search);

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

  outline: 0;

  &:focus {
    border: 1px solid var(--twitter);

    ~ svg {
      fill: var(--twitter);
    }
  }
`;

export const SearchIcon = styled(Search)`
  width: 27px;
  height: 27px;
  fill: var(--gray);
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px 24px 200px;
  margin-top: 3px;

  > div + div {
    margin-top: 15px;
  }
`;

export const HashtagDropdown = styled.div`
  position: absolute;
  top: 45px;
  left: 0;
  right: 0;
  background-color: var(--primary);
  border: 1px solid var(--outline);
  border-radius: 8px;
  z-index: 10;
  overflow: hidden;
`;

export const HashtagItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--outline);
  color: var(--twitter);
  font-weight: bold;

  &:hover {
    background: var(--search);
  }
`;

export const StatusMessage = styled.span`
  display: block;
  padding: 10px 15px;
  color: var(--gray);
  font-size: 14px;
`;
