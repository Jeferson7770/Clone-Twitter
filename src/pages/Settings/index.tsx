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
              <strong
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {currentTheme === 'light' ? (
                  <>
                    Claro
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  </>
                ) : (
                  <>
                    Escuro
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  </>
                )}
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
