'use client';

import * as React from 'react';

export interface UserSession {
  email: string;
  name?: string | null;
  role?: string | null;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
  userRole: string | null;
  logout: () => Promise<void>;
  openGate: (tab?: 'login' | 'register') => void;
  setSession: (session: UserSession | null) => void;
  syncSession: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  userEmail: null,
  userName: null,
  userRole: null,
  logout: async () => {},
  openGate: () => {},
  setSession: () => {},
  syncSession: async () => {},
});

export function useAuth() {
  return React.useContext(AuthContext);
}
