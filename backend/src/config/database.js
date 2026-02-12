const { Sequelize } = require('sequelize');
require('dotenv').config();

// PostgreSQL Connection
const sequelize = new Sequelize(
    process.env.DB_NAME || 'ccms',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'password',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Redis Connection (Optional - graceful fallback)
let redisClient = null;

const initRedis = async () => {
    // Skip Redis in test environment
    if (process.env.NODE_ENV === 'test') {
        return;
    }
    if (process.env.REDIS_URL || process.env.NODE_ENV === 'production') {
        try {
            const redis = require('redis');
            redisClient = redis.createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379'
            });

            redisClient.on('error', (err) => {
                console.warn('Redis Client Error (non-fatal):', err.message);
            });

            await redisClient.connect();
            console.log('✅ Redis Connected');
        } catch (err) {
            console.warn('⚠️  Redis unavailable, running without cache:', err.message);
            redisClient = null;
        }
    } else {
        console.log('ℹ️  Redis disabled in development (set REDIS_URL to enable)');
    }
};

// Initialize Redis asynchronously (non-blocking)
initRedis().catch(() => { });

module.exports = {
    sequelize,
    redisClient,
    initRedis
};
