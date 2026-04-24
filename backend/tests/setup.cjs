process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-ci';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DATABASE_URL = ':memory:';
process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
process.env.FRONTEND_URL = 'http://localhost:5173';
