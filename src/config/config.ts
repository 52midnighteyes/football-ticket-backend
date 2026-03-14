import dotenv from "dotenv";
import { AppError } from "../class/appError.js";
dotenv.config();

class EnvConfig {
  public readonly PORT: number;
  public readonly JWT_SECRET: string;
  public readonly NODE_ENV: string;
  public readonly DATABASE_URL: string;
  public readonly DIRECT_URL: string;

  constructor() {
    this.PORT = this.toNumber("PORT", 8080);
    this.JWT_SECRET = this.required("JWT_SECRET");
    this.NODE_ENV = process.env.NODE_ENV ?? "development";
    this.DATABASE_URL = this.required("DATABASE_URL");
    this.DIRECT_URL = this.required("DIRECT_URL");
  }

  private required(name: string): string {
    const value = process.env[name];
    if (!value || value.trim() === "") throw new Error(`Missing env: ${name}`);
    return value;
  }

  private toNumber(name: string, fallback: number): number {
    const parsed = Number(process.env[name]);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
}

const env = new EnvConfig();
export const { PORT, JWT_SECRET, NODE_ENV, DATABASE_URL, DIRECT_URL } = env;
