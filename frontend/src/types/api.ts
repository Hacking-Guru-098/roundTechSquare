export type ApiOk<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  stack?: string;
};

