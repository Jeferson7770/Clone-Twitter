import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

import {
  Container,
  ModalContent,
  LogoWrapper,
  Content,
  Title,
  SubTitle,
  Form,
  InputWrapper,
  FloatingInputBox,
  NextButton,
  ErrorMessage,
} from './styles';

export const ResetPasswordPage: React.FC = () => {
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`password-reset-confirm/${uidb64}/${token}/`, {
        password: password,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error(err);

      const apiError = err as { response?: { data?: { error?: string } } };

      setError(
        apiError.response?.data?.error ||
          'O link é inválido ou expirou. Solicite a recuperação novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <ModalContent>
        <LogoWrapper>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="var(--twitter)">
            <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
          </svg>
        </LogoWrapper>

        <Content>
          {success ? (
            <>
              <Title>Senha alterada!</Title>
              <SubTitle>
                Sua senha foi redefinida com sucesso. Você será redirecionado em
                instantes...
              </SubTitle>
            </>
          ) : (
            <>
              <Title>Escolha uma nova senha</Title>
              <SubTitle>
                Certifique-se de que sua nova senha tenha pelo menos 8
                caracteres para manter sua conta segura.
              </SubTitle>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <Form onSubmit={handleSubmit}>
                <InputWrapper>
                  <FloatingInputBox>
                    <input
                      id="new-password"
                      type="password"
                      required
                      placeholder=" "
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <label htmlFor="new-password">Nova Senha</label>
                  </FloatingInputBox>
                </InputWrapper>

                <InputWrapper>
                  <FloatingInputBox>
                    <input
                      id="confirm-password"
                      type="password"
                      required
                      placeholder=" "
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <label htmlFor="confirm-password">
                      Confirmar Nova Senha
                    </label>
                  </FloatingInputBox>
                </InputWrapper>

                <NextButton type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Redefinir Senha'}
                </NextButton>
              </Form>
            </>
          )}
        </Content>
      </ModalContent>
    </Container>
  );
};
