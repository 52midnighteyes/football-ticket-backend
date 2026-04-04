export type AppError = Error & {
  statusCode: number;
  isOperational: boolean;
};

export const createAppError = (
  statusCode: number,
  message: string,
  isOperational: boolean = true,
): AppError => {
  const error = new Error(message) as AppError;

  error.name = "AppError";
  error.statusCode = statusCode;
  error.isOperational = isOperational;

  return error;
};

export const isAppError = (error: unknown): error is AppError => {
  return (
    error instanceof Error &&
    "statusCode" in error &&
    "isOperational" in error &&
    typeof error.statusCode === "number" &&
    typeof error.isOperational === "boolean"
  );
};
