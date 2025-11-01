import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as authSchema from './schema/auth';
import * as queueSchema from './schema/queue';

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...authSchema, ...queueSchema },
});

// Re-export all schema types
export * from './schema/auth';
export * from './schema/queue';