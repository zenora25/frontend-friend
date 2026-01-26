import sequelize from './config/db.js';
import { Logbook, Student, defineAssociations } from './models/index.js';

// Initialize associations
defineAssociations();

const test = async () => {
    try {
        await sequelize.authenticate();
        console.log(' Connection established.');

        // Find any logbook
        const logbook = await Logbook.findOne({
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'assignedSupervisor', 'assignedIndustrySupervisor'],
                },
            ],
        });

        if (!logbook) {
            console.log(' No logbooks found to test review logic.');
            process.exit(0);
        }

        console.log(` testing review logic for logbook ID: ${logbook.id}`);
        console.log(` Assigned Supervisor: ${logbook.student ? logbook.student.assignedSupervisor : 'NONE'}`);

        const supervisorId = logbook.student.assignedSupervisor;
        const userRole = 'institutionSupervisor';

        // Simulate the logic in reviewLogbook
        console.log(` Simulating review check for supervisor ${supervisorId}...`);

        if (userRole === "institutionSupervisor") {
            if (logbook.student.assignedSupervisor !== supervisorId) {
                console.log(' Auth logic would fail: logbook.student.assignedSupervisor !== supervisorId');
            } else {
                console.log(' Auth logic passed: logbook.student.assignedSupervisor === supervisorId');
            }
        }

        console.log(' Review logic test completed.');
        process.exit(0);
    } catch (error) {
        console.error(' Test failed:', error);
        process.exit(1);
    }
};

test();
