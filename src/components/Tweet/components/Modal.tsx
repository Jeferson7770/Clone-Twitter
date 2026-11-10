import type { ReactNode } from 'react';
import { ModalOverlay } from '../styles';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
}

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
