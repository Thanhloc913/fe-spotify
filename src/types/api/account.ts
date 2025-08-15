import type { ApiPagedRequest } from "./common";

export type ApiAccountType = {
  id: string;
  roleId: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
};

export type ApiGetAccountRequest = ApiPagedRequest & {
  username?: string;
  email?: string;
  isActive?: boolean;
  start?: string;
  end?: string;
};

export type ApiCreateAccountRequest = {
  roleId: string;
  username: string;
  email: string;
  password: string;
};

export type ApiUpdateAccountRequest = {
  id: string;
  roleId?: string;
  username?: string;
  email?: string;
  password?: string;
};

export type ApiDeleteAccountRequest = {
  id: string;
};


