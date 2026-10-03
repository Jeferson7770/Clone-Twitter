import styled, { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    color: var(--white);
  }

  html, body, #root {
    max-height: 100vh;
    max-width: 100vw;
    width: 100%;
    height: 100%;
  }

  *, button, input {
    border: 0;
    background: none;
    font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  html {
    background: var(--primary);
  }

  /* Conecta o ThemeProvider do React diretamente às tuas variáveis CSS globais */
  :root {
    --primary: ${(props) => props.theme.primary};
    --secondary: ${(props) => props.theme.secondary};
    --search: ${(props) => props.theme.search};
    --white: ${(props) => props.theme.white};
    --gray: ${(props) => props.theme.gray};
    --outline: ${(props) => props.theme.outline};
    --retweet: ${(props) => props.theme.retweet};
    --like: ${(props) => props.theme.like};
    --twitter: ${(props) => props.theme.twitter};
    --twitter-dark-hover: ${(props) => props.theme.twitterDarkHover};
    --twitter-light-hover: ${(props) => props.theme.twitterLightHover};
    --danger: ${(props) => props.theme.danger};
    --danger-hover: ${(props) => props.theme.dangerHover};
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--primary);
  color: var(--white);
`;
