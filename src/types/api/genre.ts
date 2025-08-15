import type { ApiPagedRequest } from "./common";

export type ApiGenreType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  name: string;
  description: string;
};

export type ApiGetGenreRequest = ApiPagedRequest & {
  name?: string;
};

export type ApiCreateGenreRequest = {
  name: string;
  description: string;
};

export type ApiEditGenreRequest = {
  id: string;
  name: string;
  description: string;
};

export type ApiDeleteGenresRequest = {
  ids: string[];
};


