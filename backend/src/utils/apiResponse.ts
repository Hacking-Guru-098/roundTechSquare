export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string>;
};

export function ok<T>(data: T): ApiSuccessResponse<T> {
  return { success: true, data };
}
