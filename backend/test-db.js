import sequelize from './config/db.js';

const test = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection has been established successfully.');

        const [results, metadata] = await sequelize.query("SHOW COLUMNS FROM siwescoordinators");
        console.log('\n📊 Columns in siwescoordinators:');
        results.forEach(col => console.log(` - ${col.Field} (${col.Type})`));

        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

test();
