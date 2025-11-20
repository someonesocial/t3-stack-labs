import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Type-safe environment variable access
type Env = { DATABASE_URL: string };

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // seed: 'tsx prisma/seed.ts', // Uncomment if you add a seed script
  },
  datasource: {
    url: env<Env>('DATABASE_URL'),
    // shadowDatabaseUrl: env<Env>('SHADOW_DATABASE_URL'), // Optional for Migrate in CI
  },
});
