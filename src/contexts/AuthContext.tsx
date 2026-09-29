/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import axios from 'axios';
import { api } from '../services/api';

export interface Profile {
  avatar: string | null;
  bio: string;
  location: string;
  birth_date: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  profile: Profile;
  followers_count: number;
  following_count: number;
  tweets_count?: number;
}

interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email?: string;
  password: string;
  first_name?: string;
  birth_date?: string;
  avatar?: File | null;
}

export interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => void;
  updateUser: (updatedUser: User) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextData | undefined>(
  undefined
);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = () => {
    localStorage.removeItem('@Twitter:token');
    localStorage.removeItem('@Twitter:refresh_token');
    setUser(null);
  };

  useEffect(() => {
    async function loadStoredAuth() {
      const token = localStorage.getItem('@Twitter:token');

      if (token) {
        try {
          const response = await api.get<User>('/me/');
          setUser(response.data);
        } catch (error) {
          console.error('Token inválido ou expirado:', error);
          signOut();
        }
      }
      setLoading(false);
    }

    loadStoredAuth();
  }, []);

  const signIn = async ({ username, password }: LoginCredentials) => {
    const response = await api.post('/token/', { username, password });
    const { access, refresh } = response.data;

    localStorage.setItem('@Twitter:token', access);
    localStorage.setItem('@Twitter:refresh_token', refresh);

    const userResponse = await api.get<User>('/me/');
    setUser(userResponse.data);
  };

  const signUp = async (credentials: RegisterCredentials) => {
    const formData = new FormData();
    formData.append('username', credentials.username.trim());
    formData.append('password', credentials.password);

    if (credentials.email?.trim()) {
      formData.append('email', credentials.email.trim());
    }
    if (credentials.first_name?.trim()) {
      formData.append('first_name', credentials.first_name.trim());
    }
    if (credentials.birth_date?.trim()) {
      formData.append('birth_date', credentials.birth_date.trim());
    }
    if (credentials.avatar instanceof File) {
      formData.append('avatar', credentials.avatar);
    }

    try {
      await api.post('/register/', formData);

      await signIn({
        username: credentials.username,
        password: credentials.password,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        console.error('Validação DRF:', error.response.data);
      }
      throw error;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
