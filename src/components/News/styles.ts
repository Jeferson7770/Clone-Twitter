import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  font-size: 14px;
  transition: background-color 0.2s;

  /* ADICIONADO: Arredondamento e margem para descolar das bordas */
  border-radius: 16px;
  margin: 4px 8px;

  /* ALTERADO: Tornar a linha de baixo menos visível ou removê-la para não chocar com o arredondamento */
  border-bottom: 1px solid transparent; /* ou remova esta linha se preferir */

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

    color: var(--white);

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const NewsListContainer = styled.div`
  display: flex;
  flex-direction: column;

  max-height: 400px;
  overflow-y: auto;

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
