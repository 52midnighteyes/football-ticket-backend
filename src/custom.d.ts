export interface IUserParams {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface IValidatedRequest {
  query?: unknown;
  body?: unknown;
  params?: unknown;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserParams;
      validated?: IValidatedRequest;
    }
  }
}

export {};
