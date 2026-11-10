'use client';

import * as React from 'react';

export interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
  userRole: string | null;
  logout: () => Promise<void>;
  openGate: (tab?: 'login' | 'register') => void;
}

export const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  userEmail: null,
  userName: null,
  userRole: null,
  logout: async () => {},
  openGate: () => {},
});

export function useAuth() {
  return React.useContext(AuthContext);
}
