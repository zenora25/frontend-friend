
import sequelize from './config/db.js';
import Student from './models/student.js';
import HOD from './models/hod.js';

const diagnose = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection established.');

        const hods = await HOD.findAll();
        console.log('\n--- HODs ---');
        hods.forEach(h => {
            console.log(`ID: ${h.id}, Name: ${h.fullName}, Dept: "${h.department}"`);
        });

        const students = await Student.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']]
        });
        console.log('\n--- Recent Students ---');
        students.forEach(s => {
            console.log(`ID: ${s.id}, Name: ${s.fullName}, Dept: "${s.department}", Status: ${s.status}, Verified: ${s.isVerified}`);
        });

        if (hods.length > 0 && students.length > 0) {
            const firstHod = hods[0];
            const matchingStudents = await Student.count({
                where: { department: firstHod.department }
            });
            console.log(`\n🔍 Students matching HOD "${firstHod.fullName}"'s department ("${firstHod.department}"): ${matchingStudents}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

diagnose();
