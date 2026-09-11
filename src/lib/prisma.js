// import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "../../generated/prisma/client";

neonConfig.fetchConnectionCache = true;

const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = globalThis;

export const prisma =
    globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}