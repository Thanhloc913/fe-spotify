import { create } from "zustand";

interface PaginationState {
  page: number;
  setPage: (page: number) => void;
}

export const usePaginationStore = create<PaginationState>((set) => ({
  page: 1,
  setPage: (page) => set({ page }),
}));
