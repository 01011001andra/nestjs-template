import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

// ⚠️ Kalau generator kamu pakai output custom, import dari situ
// generator client { provider = "prisma-client", output = "../generated/prisma" }
import { PrismaClient } from '../generated/prisma/client';
// kalau pakai default (tanpa output), pakai: import { PrismaClient } from '@prisma/client';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  // sama dengan DATABASE_URL kamu
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});
