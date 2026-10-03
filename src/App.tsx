import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

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
import { lightTheme, darkTheme } from './styles/themes';


const FeedWrapper = () => {
  const { hashtag } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  let activeHashtag = hashtag;
  if (!activeHashtag && query) {
    activeHashtag = query.replace('#', '');
  }

  return <Feed hashtag={activeHashtag} />;
};

export function App() {
  const { user, loading } = useAuth();

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('twitter-theme');
    return savedTheme ? savedTheme : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('twitter-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        <GlobalStyles />
        <LoadingContainer>A carregar...</LoadingContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
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
          element={
            user ? (
              <Layout toggleTheme={toggleTheme} currentTheme={theme} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        >
          <Route index element={<Feed />} />

          <Route path="search" element={<FeedWrapper />} />
          <Route path="hashtag/:hashtag" element={<FeedWrapper />} />

          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:username" element={<ProfilePage />} />

          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route
            path="settings"
            element={
              <SettingsPage toggleTheme={toggleTheme} currentTheme={theme} />
            }
          />
          <Route path="status/:id" element={<TweetPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
