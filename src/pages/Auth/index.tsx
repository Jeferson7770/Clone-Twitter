import React, { useState, type ChangeEvent } from 'react';
import axios from 'axios';
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
    if (!firstName || !username || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleFinalSubmit = async (selectedAvatar: File | null = avatar) => {
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await signUp({
          username,
          password,
          email,
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
        if (data.detail) {
          setError(data.detail);
        } else if (data.username) {
          setError(`Usuário: ${data.username[0]}`);
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
        {isRegister && step === 2 ? (
          <BackButton onClick={() => setStep(1)}>
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

        {!isRegister ? (
          /* LOGIN DIRETO */
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
              <span>Esqueceu sua senha?</span>
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
          /* REGISTRO - ETAPA 1: DADOS */
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
                  <label htmlFor="email">Celular ou e-mail</label>
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
          /* REGISTRO - ETAPA 2: FOTO DE PERFIL */
          <>
            <Title>Escolher uma foto de perfil</Title>
            <SubTitle>Tem uma selfie favorita? Carregue agora.</SubTitle>

            <UploadBox>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              {avatarPreview ? (
                <AvatarPreview src={avatarPreview} alt="Preview do avatar" />
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
