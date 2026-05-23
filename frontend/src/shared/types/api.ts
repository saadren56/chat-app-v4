export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}
