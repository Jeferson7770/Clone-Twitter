import {
  DeleteModalCard,
  DeleteModalRowActions,
  DeleteModalText,
} from '../styles';
import Modal from './Modal';

interface DeleteTweetModalProps {
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Confirmação de exclusão do tweet. */
const DeleteTweetModal = ({
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteTweetModalProps) => (
  <Modal onClose={onCancel}>
    <DeleteModalCard onClick={(e) => e.stopPropagation()}>
      <h3>Excluir Tweet?</h3>
      <DeleteModalText>
        Isso não pode ser desfeito. Ele será removido do seu perfil, da linha do
        tempo de qualquer conta que segue você e dos resultados de busca.
      </DeleteModalText>
      <DeleteModalRowActions>
        <button className="cancel-btn" onClick={onCancel}>
          Cancelar
        </button>
        <button
          className="confirm-btn"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? 'Excluindo...' : 'Excluir'}
        </button>
      </DeleteModalRowActions>
    </DeleteModalCard>
  </Modal>
);

export default DeleteTweetModal;
