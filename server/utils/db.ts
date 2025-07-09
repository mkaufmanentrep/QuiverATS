import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

import pg from 'pg';

let client: pg.Client | null;
let drizzleInstance: NodePgDatabase;

const isRunningLocally = () =>
  process.env.NUXT_DB_HOST?.includes('localhost') || process.env.NUXT_DB_HOST?.includes('127.0.0.1');

export async function useDatabase() {
  try {
    const config = useRuntimeConfig();
    if (client && drizzleInstance) return drizzleInstance;

    if (!config.db.host) throw new Error('Missing db.host in runtime config');

    console.log('Connecting to database:', {
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user: config.db.user,
    });

    client = new pg.Client({
      ...config.db,
      ssl: isRunningLocally()
        ? false
        : {
            rejectUnauthorized: false,
          },
    });

    await client.connect();
    console.log('Database connected successfully');

    drizzleInstance = drizzle(client);
    
    // Test the connection
    await drizzleInstance.execute(sql`SELECT 1`);
    console.log('Database query test successful');
    
    return drizzleInstance;
  } catch (error) {
    console.error('Error setting up database:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: IS_DEV ? (error instanceof Error ? error.stack : undefined) : undefined,
    });
    
    // Don't exit process in production, let the error bubble up
    if (process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      process.exit(1);
    }
  }
}
