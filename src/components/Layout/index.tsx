import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import MenuBar from '../MenuBar';
import SideBar from '../SideBar';

import { Container, Wrapper, Main } from './styles';

const Layout: React.FC = () => {
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith('/messages');

  return (
    <Container>
      <Wrapper>
        <MenuBar />

        <Main $isMessagesPage={isMessagesPage}>
          <Outlet />
        </Main>

        {!isMessagesPage && <SideBar />}
      </Wrapper>
    </Container>
  );
};

export default Layout;
