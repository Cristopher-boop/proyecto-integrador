export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}
