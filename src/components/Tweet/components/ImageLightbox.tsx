import {
  CloseImageButton,
  ExpandedImage,
  ImageModalOverlay,
  ModalContentBox,
} from '../styles';

interface ImageLightboxProps {
  src: string;
  onClose: () => void;
}

/** Imagem ampliada em tela cheia. */
const ImageLightbox = ({ src, onClose }: ImageLightboxProps) => (
  <ImageModalOverlay onClick={onClose}>
    <ModalContentBox onClick={(e) => e.stopPropagation()}>
      <CloseImageButton onClick={onClose}>✕</CloseImageButton>
      <ExpandedImage src={src} alt="Imagem ampliada" />
    </ModalContentBox>
  </ImageModalOverlay>
);

export default ImageLightbox;
