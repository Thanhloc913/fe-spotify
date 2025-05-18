import { create } from "zustand";

export interface AdminLoadingState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useAdminLoading = create<AdminLoadingState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: Math.max(0, state.count - 1) })),
}));
