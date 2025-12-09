import React, { createContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

interface AuthContextProps {
  isExpired: boolean;
  logout: () => void;
  token: string | null;
}

export const AuthContext = createContext<AuthContextProps>({
  isExpired: false,
  logout: () => {},
  token: null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const checkToken = (token: string | null) => {
    if (!token) return true;

    try {
      const decoded: { exp: number } = jwtDecode(token);
      const now = Date.now() / 1000;
      return decoded.exp < now;
    } catch (e) {
      console.log('Token decode error:', e);
      return true;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setToken(null);
    setIsExpired(true);
  };

  useEffect(() => {
    const init = async () => {
      const storedToken = await AsyncStorage.getItem('authToken');
      setToken(storedToken);

      if (checkToken(storedToken)) {
        logout();
      } else {
        setIsExpired(false);
      }
    };

    init();

    const interval = setInterval(async () => {
      const storedToken = await AsyncStorage.getItem('authToken');
      if (checkToken(storedToken)) {
        logout();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ isExpired, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};
