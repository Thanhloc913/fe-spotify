import type { ApiPagedRequest } from "./common";

export type ApiRoleType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  name: string;
  description: string;
};

export type ApiGetRoleRequest = ApiPagedRequest & {
  name?: string;
};

export type ApiCreateRoleRequest = {
  name: string;
  description: string;
};

export type ApiEditRoleRequest = {
  id: string;
  name: string;
  description: string;
};

export type ApiDeleteRolesRequest = {
  ids: string[];
};


