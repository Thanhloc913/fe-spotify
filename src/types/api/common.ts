export type ApiPaginatedResult<T> = {
  result: T[];
  currentPage: number;
  total: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

export type ApiPagedRequest = {
  page: number;
  pageSize: number;
};


