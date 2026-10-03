import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import MenuBar from '../MenuBar';
import SideBar from '../SideBar';

import { Container, Wrapper, Main } from './styles';

// Define as props que o Layout vai receber do App.js
interface LayoutProps {
  toggleTheme: () => void;
  currentTheme: string;
}

const Layout: React.FC<LayoutProps> = ({ toggleTheme, currentTheme }) => {
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith('/messages');

  return (
    <Container>
      <Wrapper>
        {/* Passa a função para a MenuBar para poderes adicionar o botão lá */}
        <MenuBar toggleTheme={toggleTheme} currentTheme={currentTheme} />

        <Main $isMessagesPage={isMessagesPage}>
          <Outlet />
        </Main>

        {!isMessagesPage && <SideBar />}
      </Wrapper>
    </Container>
  );
};

export default Layout;
