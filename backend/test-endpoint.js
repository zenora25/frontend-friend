import sequelize from './config/db.js';
import Student from './models/student.js';
import Logbook from './models/logbook.js';
import InstitutionSupervisor from './models/institutionSupervisor.js';
import { Op } from 'sequelize';

const test = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection has been established successfully.');

        const supervisorId = 1; // Assuming 1 exists or adjust as needed
        const page = 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        console.log(`👨‍🎓 Testing getAssignedStudents logic for supervisor: ${supervisorId}`);

        const startTime = Date.now();

        const { count, rows: students } = await Student.findAndCountAll({
            where: { assignedSupervisor: supervisorId },
            attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName', 'progress', 'status', 'password'],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit) || 20,
            offset: parseInt(offset) || 0
        });

        console.log(`📊 Found ${count} students. Fetching details for ${students.length} students...`);

        const studentsWithLogbooks = await Promise.all(
            students.map(async (student) => {
                console.log(`🔍 Fetching for student: ${student.id}`);
                const logbooks = await Logbook.findAll({
                    where: { studentId: student.id },
                    attributes: ['id', 'weekNumber', 'title', 'status', 'createdAt'],
                    limit: 5,
                    order: [['weekNumber', 'DESC']]
                });

                const supervisor = await InstitutionSupervisor.findByPk(student.assignedSupervisor, {
                    attributes: ['id', 'fullName', 'email']
                });

                const studentData = student.toJSON();
                studentData.Logbooks = logbooks;
                studentData.Supervisor = supervisor;

                return studentData;
            })
        );

        const endTime = Date.now();
        console.log(`✅ Success! Time taken: ${endTime - startTime}ms`);
        console.log(`📦 Result count: ${studentsWithLogbooks.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        if (error.parent) console.error('   SQL:', error.parent.sql);
        process.exit(1);
    }
};

test();
