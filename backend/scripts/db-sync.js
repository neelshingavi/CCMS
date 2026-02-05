const { sequelize } = require('../src/config/database');
const { User, Event, Attendance, Vote, Feedback, Certificate } = require('../src/models');
const logger = require('../src/config/logger');

async function syncDatabase() {
    try {
        console.log('🔄 Connecting to Database...');
        await sequelize.authenticate();
        console.log('✅ Database Connected!');

        console.log('🔄 Synchronizing Models...');
        // force: false ensures we don't wipe data if it exists. 
        // alter: true updates schema if changed.
        await sequelize.sync({ alter: true });

        console.log('✅ All Tables Created/Updated Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database Sync Failed:', error);
        console.log('\n💡 TROUBLESHOOTING:');
        console.log('1. Make sure PostgreSQL is running');
        console.log(`2. Check if database "${process.env.DB_NAME || 'ccms'}" exists`);
        console.log('3. Verify username/password in backend/.env');
        console.log('   (On macOS, try using your system username if "postgres" fails)');
        process.exit(1);
    }
}

syncDatabase();
