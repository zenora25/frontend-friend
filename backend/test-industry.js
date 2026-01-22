import sequelize from './config/db.js';
import { IndustrySupervisor, Student, Logbook, defineAssociations } from './models/index.js';

// Initialize associations
defineAssociations();

const test = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection established.');

        // Find any industry supervisor
        const supervisor = await IndustrySupervisor.findOne();

        if (!supervisor) {
            console.log('ℹ️ No industry supervisors found to test.');
            process.exit(0);
        }

        console.log(`🔍 Testing dashboard logic for supervisor ID: ${supervisor.id} (${supervisor.fullName})`);

        // Test the AssingedInterns include logic
        const supervisorWithInterns = await IndustrySupervisor.findByPk(supervisor.id, {
            attributes: ['id', 'fullName', 'email', 'companyName'],
            include: [{
                model: Student,
                as: "AssignedInterns",
                attributes: ['id', 'fullName'],
                include: [{
                    model: Logbook,
                    as: 'Logbooks', // In Student.hasMany(Logbook, { as: 'Logbooks' })
                    attributes: ['id', 'weekNumber'],
                    limit: 3
                }]
            }]
        });

        console.log(`✅ IndustrySupervisor.findByPk passed. Found ${supervisorWithInterns.AssignedInterns.length} interns.`);

        // Test logbook find with student alias
        if (supervisorWithInterns.AssignedInterns.length > 0) {
            const studentId = supervisorWithInterns.AssignedInterns[0].id;
            const logbooks = await Logbook.findAll({
                where: { studentId },
                include: [{
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'fullName']
                }]
            });
            console.log(`✅ Logbook.findAll with student alias passed. Found ${logbooks.length} logbooks.`);
        }

        console.log('✅ Industry supervisor logic test completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

test();
