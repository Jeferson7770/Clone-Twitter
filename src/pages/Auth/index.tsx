/* eslint-disable react-refresh/only-export-components */
import React, { useState, type ChangeEvent } from 'react';
import axios from 'axios';
import { api } from '../../services/api'; 
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Header,
  BackButton,
  BackIcon,
  TwitterLogo,
  Content,
  Title,
  SubTitle,
  Form,
  InputWrapper,
  FloatingInputBox,
  CharCounter,
  UploadBox,
  UploadIcon,
  AvatarPreview,
  FooterActions,
  NextButton,
  SkipButton,
  FooterLinks,
  ErrorMessage,
} from './styles';

export const AuthPage: React.FC = () => {
  const { signIn, signUp } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !username || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (firstName.length > 50) {
      setError('O nome não pode ter mais de 50 caracteres.');
      return;
    }

    if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/\d/.test(password)
    ) {
      setError(
        'A senha deve ter pelo menos 8 caracteres, incluindo pelo menos uma letra e um número.'
      );
      return;
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError(
          'Por favor, insira um e-mail válido (ex: usuario@dominio.com).'
        );
        return;
      }
    }

    setStep(2);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Por favor, insira o e-mail cadastrado na conta.');
      return;
    }

    setLoading(true);
    try {
      await api.post('password-reset/', {
        email: email.trim(),
      });
      setForgotPasswordSuccess(true);
    } catch (err) {
      console.error(err);
      setError(
        'Ocorreu um erro ao tentar processar a solicitação. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (selectedAvatar: File | null = avatar) => {
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await signUp({
          username,
          password,
          email: email.trim() ? email.trim() : undefined,
          first_name: firstName,
          birth_date: birthDate,
          avatar: selectedAvatar,
        });
      } else {
        await signIn({ username, password });
      }
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data;

        if (err.response.status === 401) {
          setError(
            'Sua sessão expirou ou as credenciais são inválidas. Por favor, faça login novamente.'
          );
        } else if (data.detail) {
          setError(data.detail);
        } else if (data.username) {
          setError(`Usuário: ${data.username[0]}`);
        } else if (data.email) {
          setError(`E-mail: ${data.email[0]}`);
        } else {
          setError('Ocorreu um erro ao processar sua solicitação.');
        }
      } else {
        setError('Não foi possível conectar ao servidor backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        {(isRegister && step === 2) || isForgotPassword ? (
          <BackButton
            onClick={() => {
              if (isForgotPassword) {
                setIsForgotPassword(false);
                setForgotPasswordSuccess(false);
                setError(null);
              } else {
                setStep(1);
              }
            }}
          >
            <BackIcon />
          </BackButton>
        ) : (
          <div style={{ width: 40 }} />
        )}
        <TwitterLogo />
        <div style={{ width: 40 }} />
      </Header>

      <Content>
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {isForgotPassword ? (
          <>
            <Title>Encontre sua conta do Twitter</Title>
            {forgotPasswordSuccess ? (
              <>
                <SubTitle style={{ marginTop: '10px', marginBottom: '20px' }}>
                  Se o e-mail existir em nossa base, você receberá um link com
                  as instruções para redefinir sua senha.
                </SubTitle>
                <FooterActions>
                  <NextButton
                    onClick={() => {
                      setIsForgotPassword(false);
                      setForgotPasswordSuccess(false);
                      setEmail('');
                    }}
                  >
                    Voltar ao Login
                  </NextButton>
                </FooterActions>
              </>
            ) : (
              <>
                <SubTitle style={{ marginTop: '10px', marginBottom: '20px' }}>
                  Insira o e-mail associado à sua conta para alterar sua senha.
                </SubTitle>
                <Form onSubmit={handleForgotPassword}>
                  <InputWrapper>
                    <FloatingInputBox>
                      <label htmlFor="reset-email">E-mail cadastrado</label>
                      <input
                        id="reset-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ex: joao@email.com"
                      />
                    </FloatingInputBox>
                  </InputWrapper>

                  <NextButton type="submit" disabled={loading}>
                    {loading ? 'Buscando...' : 'Avançar'}
                  </NextButton>
                </Form>
                <FooterLinks>
                  <span
                    onClick={() => {
                      setIsForgotPassword(false);
                      setError(null);
                    }}
                  >
                    Voltar ao Login
                  </span>
                </FooterLinks>
              </>
            )}
          </>
        ) : !isRegister ? (
          <>
            <Title>Entrar no Twitter</Title>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleFinalSubmit(null);
              }}
            >
              <InputWrapper>
                <FloatingInputBox>
                  <label htmlFor="login-username">Usuário ou E-mail</label>
                  <input
                    id="login-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: joao"
                  />
                </FloatingInputBox>
              </InputWrapper>

              <InputWrapper>
                <FloatingInputBox>
                  <label htmlFor="login-password">Senha</label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </FloatingInputBox>
              </InputWrapper>

              <NextButton type="submit" disabled={loading}>
                {loading ? 'Carregando...' : 'Entrar'}
              </NextButton>
            </Form>

            <FooterLinks>
              <span
                onClick={() => {
                  setIsForgotPassword(true);
                  setError(null);
                  setForgotPasswordSuccess(false);
                }}
              >
                Esqueceu sua senha?
              </span>
              <span className="dot">•</span>
              <span
                onClick={() => {
                  setIsRegister(true);
                  setStep(1);
                  setError(null);
                }}
              >
                Inscrever-se no Twitter
              </span>
            </FooterLinks>
          </>
        ) : step === 1 ? (
          <>
            <Title>Criar sua conta</Title>
            <Form onSubmit={handleNextStep}>
              <InputWrapper>
                <FloatingInputBox>
                  <label htmlFor="name">Nome</label>
                  <input
                    id="name"
                    type="text"
                    maxLength={50}
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FloatingInputBox>
                <CharCounter>{firstName.length}/50</CharCounter>
              </InputWrapper>

              <InputWrapper>
                <FloatingInputBox>
                  <label htmlFor="reg-username">Nome de Usuário (@)</label>
                  <input
                    id="reg-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </FloatingInputBox>
              </InputWrapper>

              <InputWrapper>
                <FloatingInputBox>
                  <label htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FloatingInputBox>
              </InputWrapper>

              <InputWrapper>
                <FloatingInputBox>
                  <label htmlFor="password">Senha</label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FloatingInputBox>
              </InputWrapper>

              <InputWrapper>
                <FloatingInputBox>
                  <label htmlFor="birth">Data de nascimento</label>
                  <input
                    id="birth"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </FloatingInputBox>
              </InputWrapper>

              <FooterActions>
                <NextButton type="submit">Próximo</NextButton>
              </FooterActions>
            </Form>

            <FooterLinks>
              <span
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
              >
                Já tem uma conta? Entrar
              </span>
            </FooterLinks>
          </>
        ) : (
          <>
            <Title>Escolher uma foto de perfil</Title>
            <SubTitle>
              Tem uma selfie favorita? Carregue agora para o seu perfil.
            </SubTitle>

            <UploadBox>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              {avatarPreview ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                >
                  <AvatarPreview src={avatarPreview} alt="Preview do avatar" />
                </div>
              ) : (
                <>
                  <UploadIcon />
                  <span>Carregar</span>
                </>
              )}
            </UploadBox>

            <FooterActions>
              <SkipButton
                type="button"
                onClick={() => handleFinalSubmit(null)}
                disabled={loading}
              >
                Ignorar por enquanto
              </SkipButton>

              <NextButton
                type="button"
                onClick={() => handleFinalSubmit(avatar)}
                disabled={loading}
              >
                {loading ? 'Finalizando...' : 'Avançar'}
              </NextButton>
            </FooterActions>
          </>
        )}
      </Content>
    </Container>
  );
};
