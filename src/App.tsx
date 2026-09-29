import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './hooks/useAuth';
import { AuthPage } from './pages/Auth';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

import Layout from './components/Layout';
import Feed from './components/Feed';
import ProfilePage from './components/ProfilePage';
import TweetPage from './components/TweetPage';
import FavoritesPage from './components/FavoritesPage';
import MessagesPage from './pages/Messages';
import SettingsPage from './pages/Settings';
import GlobalStyles, { LoadingContainer } from './styles/GlobalStyles';

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <>
        <GlobalStyles />
        <LoadingContainer>A carregar...</LoadingContainer>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <Routes>
        <Route
          path="/auth"
          element={!user ? <AuthPage /> : <Navigate to="/" replace />}
        />

        <Route
          path="/reset-password/:uidb64/:token"
          element={!user ? <ResetPasswordPage /> : <Navigate to="/" replace />}
        />

        <Route
          path="/"
          element={user ? <Layout /> : <Navigate to="/auth" replace />}
        >
          <Route index element={<Feed />} />

          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:username" element={<ProfilePage />} />

          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="status/:id" element={<TweetPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
