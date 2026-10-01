import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--secondary);
  border-radius: 14px;
`;

export const Item = styled.div`
  padding: 10px 16px;

  & + div {
    border-top: 1px solid var(--outline);
  }

  &:first-child {
    padding-top: 13px;
  }

  &:last-child {
    padding-bottom: 17px;
  }
`;

export const Title = styled.span`
  font-weight: bold;
  font-size: 19px;
`;

export const ScrollableContent = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--outline);

  /* Altura ajustada para exibir exatamente até 3 itens com rolagem */
  max-height: 210px;
  overflow-y: auto;

  /* Esconde a barra de rolagem no Firefox */
  scrollbar-width: none;

  /* Esconde a barra de rolagem no Chrome, Safari e Edge */
  &::-webkit-scrollbar {
    display: none;
  }
`;
