import { PrismaClient } from "../../../generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";

class PrismaConfig {
  public prisma: PrismaClient;
  constructor() {
    const adapter = new PrismaNeon({
      connectionString: process.env.DATABASE_URL!,
    });
    this.prisma = new PrismaClient({ adapter });
  }

  public async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

const prismaClient = new PrismaConfig();
export const prisma = prismaClient.prisma;
