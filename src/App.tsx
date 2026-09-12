import { useAuth } from './hooks/useAuth';
import { AuthPage } from './pages/Auth';
import Layout from './components/Layout';
import GlobalStyles, { LoadingContainer } from './styles/GlobalStyles';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <>
        <GlobalStyles />
        <LoadingContainer>Carregando...</LoadingContainer>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      {!user ? <AuthPage /> : <Layout />}
    </>
  );
}

export default App;
