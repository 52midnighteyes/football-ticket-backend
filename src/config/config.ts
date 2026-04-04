import dotenv from "dotenv";
dotenv.config();

class EnvConfig {
  public readonly PORT: number;
  public readonly JWT_SECRET: string;
  public readonly NODE_ENV: string;
  public readonly DATABASE_URL: string;
  public readonly FRONTEND_URL: string;
  public readonly REFRESH_TOKEN_SECRET: string;

  constructor() {
    this.PORT = this.toNumber("PORT", 8080);
    this.JWT_SECRET = this.required("JWT_SECRET");
    this.NODE_ENV = process.env.NODE_ENV || "development";
    this.DATABASE_URL = this.required("DATABASE_URL");
    this.FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:3000`;
    this.REFRESH_TOKEN_SECRET = this.required("REFRESH_TOKEN_SECRET");
  }

  private required(name: string): string {
    const value = process.env[name];
    if (!value || value.trim() === "") {
      throw new Error(`Missing env: ${name}`);
    }
    return value;
  }

  private toNumber(name: string, fallback: number): number {
    const value = process.env[name];

    if (!value || value.trim() === "") return fallback;

    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid number env: ${name}`);
    }

    return parsed;
  }
}

export const env = new EnvConfig();

export const {
  PORT,
  JWT_SECRET,
  NODE_ENV,
  DATABASE_URL,
  FRONTEND_URL,
  REFRESH_TOKEN_SECRET,
} = env;
