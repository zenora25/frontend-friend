
import sequelize from './config/db.js';
import Student from './models/student.js';

const fixMismatches = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection established.');

        const mapping = {
            'cs': 'Computer Science',
            'se': 'Software Engineering',
            'it': 'Information Technology',
            'cy': 'Cybersecurity'
        };

        let totalUpdated = 0;

        for (const [code, fullName] of Object.entries(mapping)) {
            const [results] = await sequelize.query(
                `UPDATE students SET department = :fullName WHERE department = :code`,
                {
                    replacements: { code, fullName }
                }
            );
            console.log(`Updated ${results.affectedRows || 0} students from "${code}" to "${fullName}"`);
            totalUpdated += (results.affectedRows || 0);
        }

        console.log(`\n✅ Total students updated: ${totalUpdated}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixMismatches();
