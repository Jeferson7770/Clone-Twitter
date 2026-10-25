import type { ReactNode } from 'react';
import { ModalOverlay } from '../styles';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
}

/** Fundo escurecido que fecha o modal ao clicar fora do conteúdo. */
const Modal = ({ onClose, children }: ModalProps) => (
  <ModalOverlay
    onClick={(e) => {
      e.stopPropagation();
      onClose();
    }}
  >
    {children}
  </ModalOverlay>
);

export default Modal;
