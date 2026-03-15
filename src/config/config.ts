import dotenv from "dotenv";
dotenv.config();

class EnvConfig {
  public readonly PORT: number;
  public readonly JWT_SECRET: string;
  public readonly NODE_ENV: string;
  public readonly DATABASE_URL: string;
  public readonly DIRECT_URL: string;
  public readonly CLOUDINARY_CLOUD_NAME: string;
  public readonly CLOUDINARY_API_SECRET: string;
  public readonly CLOUDINARY_API_KEY: string;

  constructor() {
    this.PORT = this.toNumber("PORT", 8080);
    this.JWT_SECRET = this.required("JWT_SECRET");
    this.NODE_ENV = process.env.NODE_ENV || "development";
    this.DATABASE_URL = this.required("DATABASE_URL");
    this.DIRECT_URL = this.required("DIRECT_URL");
    this.CLOUDINARY_CLOUD_NAME = this.required("CLOUDINARY_CLOUD_NAME");
    this.CLOUDINARY_API_SECRET = this.required("CLOUDINARY_API_SECRET");
    this.CLOUDINARY_API_KEY = this.required("CLOUDINARY_API_KEY");
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
  DIRECT_URL,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} = env;
