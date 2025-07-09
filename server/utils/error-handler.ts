import type { H3Event } from 'h3';

export function handleServerError(error: unknown, context: string = 'Unknown') {
  console.error(`[${context}] Server Error:`, {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: IS_DEV ? (error instanceof Error ? error.stack : undefined) : undefined,
    timestamp: new Date().toISOString(),
  });

  if (error instanceof Error) {
    // Database connection errors
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connection')) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Database connection failed',
        data: IS_DEV ? { originalError: error.message } : undefined,
      });
    }

    // Authentication errors
    if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication failed',
      });
    }
  }

  // Generic server error
  throw createError({
    statusCode: 500,
    statusMessage: 'Internal server error',
    data: IS_DEV ? { originalError: error instanceof Error ? error.message : 'Unknown' } : undefined,
  });
}