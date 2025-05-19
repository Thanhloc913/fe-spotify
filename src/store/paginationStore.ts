import { useCallback } from "react";
import { create } from "zustand";

interface PaginationState {
  page: number;
  setPage: (page: number) => void;
}

export const usePaginationStore = create<PaginationState>((set) => ({
  page: 1,
  setPage: (page) => set({ page }),
}));

export interface AdminLoadingState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useAdminLoadingState = create<AdminLoadingState>((set) => ({
  count: 0,
  increment: (amount = 1) =>
    set((state) => ({ count: state.count + Math.max(0, amount) })),
  decrement: (amount = 1) =>
    set((state) => ({ count: Math.max(0, state.count - Math.max(0, amount)) })),
}));

export function useAdminLoading() {
  const { increment: loadInc, decrement: loadDec } = useAdminLoadingState();

  const withLoading = useCallback(
    <Return>(asyncFn: () => Promise<Return>): (() => Promise<Return>) => {
      return async (): Promise<Return> => {
        try {
          loadInc();
          return await asyncFn();
        } finally {
          loadDec();
        }
      };
    },
    [loadInc, loadDec]
  );

  return withLoading;
}
