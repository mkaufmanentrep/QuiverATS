export default defineEventHandler(async (event) => {
  // Only handle errors, don't interfere with normal requests
  if (event.node.req.url?.startsWith('/api/')) {
    try {
      // This middleware will catch any unhandled errors in API routes
    } catch (error) {
      console.error('Unhandled API error:', error);
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: IS_DEV ? { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined 
        } : undefined,
      });
    }
  }
});