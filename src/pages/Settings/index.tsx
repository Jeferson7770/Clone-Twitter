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
  SecuritySection,
  InputGroup,
  MessageError,
  MessageSuccess,
  SaveButton,
  PasswordForm,
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

  // Estados para a alteração de senha
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Preencha todos os campos de senha.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsPasswordLoading(true);
    try {
      await api.post('/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordSuccess('Senha alterada com sucesso!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (pwdErr: unknown) {
      const errData = (
        pwdErr as {
          response?: { data?: { old_password?: string[]; detail?: string } };
        }
      ).response?.data;
      const msg =
        errData?.old_password?.[0] ||
        errData?.detail ||
        'Erro ao alterar a senha. Verifique se a atual está correta.';
      setPasswordError(msg);
    } finally {
      setIsPasswordLoading(false);
    }
  };

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
              <strong>{currentTheme === 'light' ? 'Claro' : 'Escuro'}</strong>
            </Description>
            <ThemeButton onClick={toggleTheme}>Mudar tema</ThemeButton>
          </AppearanceContainer>
        )}

        {/* Secção dedicada à Segurança e Alteração de Senha */}
        <SecuritySection>
          <Title>Segurança (Alterar Senha)</Title>
          <Description>
            Atualize a sua senha regularmente para manter a segurança da sua
            conta.
          </Description>

          {passwordError && <MessageError>{passwordError}</MessageError>}
          {passwordSuccess && (
            <MessageSuccess>{passwordSuccess}</MessageSuccess>
          )}

          <PasswordForm onSubmit={handlePasswordChange}>
            <InputGroup>
              <label>Senha Atual</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Digite sua senha atual"
              />
            </InputGroup>

            <InputGroup>
              <label>Nova Senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
              />
            </InputGroup>

            <InputGroup>
              <label>Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
              />
            </InputGroup>

            <SaveButton type="submit" disabled={isPasswordLoading}>
              {isPasswordLoading ? 'Salvando...' : 'Atualizar senha'}
            </SaveButton>
          </PasswordForm>
        </SecuritySection>

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
