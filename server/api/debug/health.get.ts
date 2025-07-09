import { sql } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    // Test database connection
    const db = await useDatabase();
    
    // Simple query to test DB connectivity
    const result = await db.execute(sql`SELECT 1 as test`);
    
    // Test memory storage
    const memoryTest = await general_memoryStorage.getItem('test') || 'not-found';
    
    // Test blob storage
    let storageStatus = 'unknown';
    try {
      await blobStorage.setItem('health-test', 'test-data');
      await blobStorage.removeItem('health-test');
      storageStatus = 'working';
    } catch (error) {
      storageStatus = 'failed';
    }
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      memory_storage: 'working',
      blob_storage: storageStatus,
      environment: process.env.NODE_ENV,
      db_host: useRuntimeConfig().db.host,
      storage_engine: useRuntimeConfig().storage.engine,
    };
  } catch (error) {
    console.error('Health check failed:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Health check failed',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: IS_DEV ? (error instanceof Error ? error.stack : undefined) : undefined,
      }
    });
  }
});