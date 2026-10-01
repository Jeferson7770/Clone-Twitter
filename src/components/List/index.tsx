import React from 'react';

import { Container, Item, Title, ScrollableContent } from './styles';

interface Props {
  title: string;
  elements: React.ReactNode[];
}

const List: React.FC<Props> = ({ title, elements }) => {
  return (
    <Container>
      <Item>
        <Title>{title}</Title>
      </Item>

      {/* Envolvemos os itens neste novo contentor com barra de rolagem */}
      <ScrollableContent>
        {elements.map((element, index) => (
          <Item key={index}>{element}</Item>
        ))}
      </ScrollableContent>
    </Container>
  );
};

export default List;
