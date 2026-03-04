import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { AppRole } from '@/lib/types';
import { apiRequest, getApiToken, setApiToken } from '@/lib/api';

type AuthUser = {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    role?: AppRole;
  };
};

type ApiUser = {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
  walletAddress?: string | null;
};

interface AuthContextType {
  user: AuthUser | null;
  session: { token: string } | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAuthUser(user: ApiUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    user_metadata: {
      full_name: user.fullName,
      role: user.role,
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateUser = async () => {
    const token = getApiToken();
    if (!token) {
      setUser(null);
      setSession(null);
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest<{ user: ApiUser }>('/auth/me');
      const authUser = toAuthUser(res.user);
      setUser(authUser);
      setSession({ token });
      setRole(res.user.role);
    } catch {
      setApiToken(null);
      setUser(null);
      setSession(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrateUser();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, roleToUse: AppRole) => {
    const res = await apiRequest<{ user: ApiUser; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, role: roleToUse }),
      },
      false,
    );
    setApiToken(res.token);
    setSession({ token: res.token });
    const authUser = toAuthUser(res.user);
    setUser(authUser);
    setRole(res.user.role);
  };

  const signIn = async (email: string, password: string) => {
    const res = await apiRequest<{ user: ApiUser; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false,
    );
    setApiToken(res.token);
    setSession({ token: res.token });
    const authUser = toAuthUser(res.user);
    setUser(authUser);
    setRole(res.user.role);
  };

  const resendConfirmation = async (_email: string) => {
    return;
  };

  const signOut = async () => {
    setApiToken(null);
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signUp, signIn, resendConfirmation, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
