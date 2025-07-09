export default defineEventHandler(async (event) => {
  try {
    // Test database connection
    const db = await useDatabase();
    
    // Simple query to test DB connectivity
    const result = await db.execute(sql`SELECT 1 as test`);
    
    // Test memory storage
    const memoryTest = await general_memoryStorage.getItem('test') || 'not-found';
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      memory_storage: 'working',
      environment: process.env.NODE_ENV,
      db_host: useRuntimeConfig().db.host,
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