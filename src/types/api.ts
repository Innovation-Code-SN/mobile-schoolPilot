export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  errorMessage?: string;
  timestamp: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}
