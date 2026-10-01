import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;

  /* Habilita a rolagem interna exclusiva para a coluna central */
  height: 100vh;
  overflow-y: auto;

  /* Oculta visualmente a barra de rolagem (design limpo como o Twitter original) */
  scrollbar-width: none; /* Funciona no Firefox */
  &::-webkit-scrollbar {
    display: none; /* Funciona no Chrome, Safari, Edge */
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: sticky; /* Prende o cabeçalho no topo da rolagem */
  top: 0;
  z-index: 2;
  background: var(
    --primary,
    #000000
  ); /* Garante que os tweets não passam por cima. Fallback preto. */
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
    flex: 1; /* Divide a largura em duas metades perfeitamente iguais */
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
