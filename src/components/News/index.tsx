import React from 'react';
import { Container, HashtagText } from './styles';

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

  const renderFormattedTitle = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith('#') && part.length > 1) {
        return <HashtagText key={index}>{part}</HashtagText>;
      }
      return part;
    });
  };

  return (
    <Container onClick={handleClick}>
      <span>{category}</span>
      <strong>{renderFormattedTitle(title)}</strong>
    </Container>
  );
};

export default News;
