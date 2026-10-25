import { useState } from 'react';
import type { MouseEvent } from 'react';
import { ImageContent, VideoContent } from '../styles';
import ImageLightbox from './ImageLightbox';

interface TweetMediaProps {
  media: string;
  mediaType?: 'image' | 'video';
  /** Clicar na imagem abre o lightbox (tweet principal). */
  expandable?: boolean;
  /** Impede que o clique suba para o card pai (tweet citado). */
  stopPropagation?: boolean;
}

/** Imagem ou vídeo de um tweet, comentário ou tweet citado. */
const TweetMedia = ({
  media,
  mediaType,
  expandable = false,
  stopPropagation = false,
}: TweetMediaProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (mediaType === 'video') {
    return (
      <VideoContent
        src={media}
        controls
        onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
      />
    );
  }

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (expandable) setIsOpen(true);
  };

  return (
    <>
      <ImageContent
        $mediaUrl={media}
        onClick={expandable || stopPropagation ? handleClick : undefined}
        title={expandable ? 'Clique para ampliar a imagem' : undefined}
      />
      {isOpen && <ImageLightbox src={media} onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default TweetMedia;
