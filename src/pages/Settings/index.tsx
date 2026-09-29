import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

import {
  Container,
  Header,
  BackIcon,
  Content,
  Title,
  Description,
  SafeMessage,
  DeleteButton,
  ConfirmModal,
  ModalContent,
  ActionGroup,
  ConfirmButton,
  CancelButton,
} from './styles';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.delete('/me/'); 

      if (signOut) {
        signOut();
      } else {
        localStorage.removeItem('token');
        navigate('/auth');
      }
    } catch (error) {
      console.error('Erro ao eliminar conta', error);
      alert('Ocorreu um erro ao tentar apagar a tua conta. Tenta novamente.');
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <button onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
        <h2>Configurações</h2>
      </Header>

      <Content>
        <Title>A tua conta</Title>
        <Description>
          Apagar a conta significa dizer adeus ao teu perfil, publicações,
          mensagens e todas as tuas interações. Tudo isto vai desaparecer para
          sempre e <strong>não há como voltar atrás</strong>.
        </Description>

        <SafeMessage>
          Vieste parar aqui por engano? Fica tranquilo, a tua conta continua a
          salvo. Basta clicares na seta lá em cima para voltares ao que estavas
          a fazer.
        </SafeMessage>

        <DeleteButton onClick={() => setIsConfirming(true)}>
          Apagar a minha conta
        </DeleteButton>
      </Content>

      {isConfirming && (
        <ConfirmModal>
          <ModalContent>
            <h3>Tens a certeza absoluta?</h3>
            <p>
              Ao confirmares, perdes o acesso à tua conta na mesma hora e todos
              os teus dados vão desaparecer para sempre.
            </p>

            <ActionGroup>
              <ConfirmButton onClick={handleDelete} disabled={isLoading}>
                {isLoading ? 'A apagar...' : 'Sim, apagar conta'}
              </ConfirmButton>

              <CancelButton
                onClick={() => setIsConfirming(false)}
                disabled={isLoading}
              >
                Cancelar
              </CancelButton>
            </ActionGroup>
          </ModalContent>
        </ConfirmModal>
      )}
    </Container>
  );
};

export default Settings;
