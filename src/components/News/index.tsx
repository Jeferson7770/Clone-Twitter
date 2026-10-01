import React from 'react';
import { Container } from './styles';

interface Props {
  category: string;
  title: string;
  url?: string;
  onClick?: () => void;
}

const News: React.FC<Props> = ({ category, title, url, onClick }) => {
  const handleClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (onClick) {
      onClick();
    }
  };

  // Garante que o título exiba no máximo um '#' no início (ex: '##Lula' vira '#Lula')
  const formattedTitle = title.replace(/^#+/, '#');

  return (
    <Container onClick={handleClick} style={{ cursor: 'pointer' }}>
      <span>{category}</span>
      <strong>{formattedTitle}</strong>
    </Container>
  );
};

export default News;
