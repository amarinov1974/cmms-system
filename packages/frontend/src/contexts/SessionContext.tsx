/**
 * Session Context
 * Manages user session state
 */

import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, type SessionResponse } from '../api/auth';

interface SessionContextType {
  session: SessionResponse['session'] | null;
  isLoading: boolean;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: authAPI.getSession,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      queryClient.setQueryData(['session'], null);
      window.location.href = '/';
    },
  });

  const session = data?.session ?? null;

  return (
    <SessionContext.Provider
      value={{
        session,
        isLoading,
        logout: () => logoutMutation.mutate(),
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
