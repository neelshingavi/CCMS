const app = require('./app');
const { sequelize } = require('./config/database');
const logger = require('./config/logger');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Database Sync (Use Migrations in Prod, Sync Force/Alter in Dev)
        // await sequelize.sync({ alter: true }); 
        // logger.info('✅ Database Synced');

        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
