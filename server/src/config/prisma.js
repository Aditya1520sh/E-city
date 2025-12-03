const { PrismaClient } = require('@prisma/client');

// Singleton Prisma instance for serverless
let prisma;

try {
  if (!process.env.DATABASE_URL) {
    console.error('❌ CRITICAL: DATABASE_URL environment variable is not set');
    console.error('Please set DATABASE_URL in Vercel environment variables');
    throw new Error('DATABASE_URL is required');
  }

  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
      log: ['error'],
    });
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
      });
    }
    prisma = global.prisma;
  }
  
  console.log('✅ Prisma client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Prisma client:', error.message);
  // Create a dummy client that throws helpful errors
  prisma = new Proxy({}, {
    get: (target, prop) => {
      return () => {
        throw new Error('Database connection not configured. Please set DATABASE_URL environment variable.');
      };
    }
  });
}

module.exports = prisma;
