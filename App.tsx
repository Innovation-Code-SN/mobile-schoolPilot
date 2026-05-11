import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { QueryProvider } from './src/contexts/QueryProvider';
import { SelectedChildProvider } from './src/contexts/SelectedChildContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function AuthenticatedProviders({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <>{children}</>;
  return <SelectedChildProvider>{children}</SelectedChildProvider>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <AuthenticatedProviders>
            <StatusBar style="dark" />
            <RootNavigator />
          </AuthenticatedProviders>
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
