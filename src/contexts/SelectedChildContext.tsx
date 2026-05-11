import { useQuery } from '@tanstack/react-query';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { parentApi } from '../api/parentApi';
import type { ChildSummary } from '../types/parent';

interface SelectedChildContextValue {
  children: ChildSummary[];
  selectedChild: ChildSummary | null;
  selectChild: (childId: number) => void;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const SelectedChildContext = createContext<SelectedChildContextValue | null>(null);

export function SelectedChildProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: parentApi.getChildren,
  });

  // Auto-sélectionner le premier enfant si rien n'est choisi
  useEffect(() => {
    if (!selectedId && query.data && query.data.length > 0) {
      setSelectedId(query.data[0].id);
    }
  }, [selectedId, query.data]);

  const selectChild = useCallback((childId: number) => {
    setSelectedId(childId);
  }, []);

  const selectedChild = useMemo(() => {
    if (!query.data || selectedId == null) return null;
    return query.data.find((c) => c.id === selectedId) ?? null;
  }, [query.data, selectedId]);

  const value = useMemo<SelectedChildContextValue>(
    () => ({
      children: query.data ?? [],
      selectedChild,
      selectChild,
      isLoading: query.isLoading,
      error: (query.error as Error) ?? null,
      refetch: query.refetch,
    }),
    [query.data, query.isLoading, query.error, query.refetch, selectedChild, selectChild]
  );

  return (
    <SelectedChildContext.Provider value={value}>{children}</SelectedChildContext.Provider>
  );
}

export function useSelectedChild(): SelectedChildContextValue {
  const ctx = useContext(SelectedChildContext);
  if (!ctx) throw new Error('useSelectedChild must be used within SelectedChildProvider');
  return ctx;
}
