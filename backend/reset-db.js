import { forceSyncModels, sequelize } from './models/index.js';

const resetDatabase = async () => {
    try {
        console.log('🛑 WARINING: This will DROP ALL TABLES and recreate them.');
        console.log('🛑 All data will be lost.');
        console.log('⏳ Starting in 3 seconds...');

        await new Promise(resolve => setTimeout(resolve, 3000));

        await sequelize.authenticate();
        console.log('✅ Connected to DB');

        await forceSyncModels();

        console.log('✅ Database reset complete. Schema should now be correct.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Reset failed:', error);
        process.exit(1);
    }
};

resetDatabase();
