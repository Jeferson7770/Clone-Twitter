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
  AppearanceContainer,
  ThemeButton,
} from './styles';

interface SettingsProps {
  toggleTheme?: () => void;
  currentTheme?: string;
}

const Settings: React.FC<SettingsProps> = ({ toggleTheme, currentTheme }) => {
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
      console.error('Erro ao excluir a conta', error);
      alert('Ocorreu um erro ao tentar excluir a sua conta. Tente novamente.');
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
        {toggleTheme && currentTheme && (
          <AppearanceContainer>
            <Title>Aparência</Title>
            <Description>
              O tema atual é:{' '}
              <strong>
                {currentTheme === 'light' ? 'Claro ☀️' : 'Escuro 🌙'}
              </strong>
            </Description>
            <ThemeButton onClick={toggleTheme}>Mudar tema</ThemeButton>
          </AppearanceContainer>
        )}

        <Title>A sua conta</Title>
        <Description>
          Excluir a conta significa dizer adeus ao seu perfil, publicações,
          mensagens e a todas as suas interações. Tudo isso vai desaparecer para
          sempre e <strong>não tem como voltar atrás.</strong>
        </Description>

        <SafeMessage>
          Veio parar aqui por engano? Fique tranquilo, a sua conta continua
          segura. Basta clicar na seta lá em cima para voltar ao que estava
          fazendo.
        </SafeMessage>

        <DeleteButton onClick={() => setIsConfirming(true)}>
          Apagar a minha conta
        </DeleteButton>
      </Content>

      {isConfirming && (
        <ConfirmModal>
          <ModalContent>
            <h3>Você tem certeza absoluta?</h3>
            <p>
              Ao confirmar, você perde o acesso à sua conta na mesma hora e
              todos os seus dados vão desaparecer para sempre.
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
