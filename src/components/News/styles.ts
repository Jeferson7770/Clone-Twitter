import styled from 'styled-components';

/* Contentor individual de cada notícia/item */
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  font-size: 14px;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--outline, #2f3336);

  &:hover {
    background-color: var(--twitter-dark-hover, rgba(255, 255, 255, 0.03));
  }

  > span {
    color: var(--gray, #71767b);
    margin-bottom: 4px;
    font-size: 12px;
  }

  > strong {
    font-size: 14px;
    line-height: 18px;
    color: #fff;

    /* Limita o texto em até 2 linhas e adiciona '...' se for maior */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

/* Contentor que envolve toda a lista no componente pai para gerar a barra de rolagem */
export const NewsListContainer = styled.div`
  display: flex;
  flex-direction: column;

  /* Altura máxima para não estourar o layout vertical */
  max-height: 400px;
  overflow-y: auto;

  /* Estilização da barra de rolagem discreta */
  scrollbar-width: thin;
  scrollbar-color: var(--gray, #5b7083) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--gray, #5b7083);
    border-radius: 4px;
  }
`;
