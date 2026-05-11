import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode, useMemo } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 1000 * 60 * 2,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
