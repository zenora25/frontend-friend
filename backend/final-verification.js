import sequelize from './config/db.js';
import Student from './models/student.js';
import InstitutionSupervisor from './models/institutionSupervisor.js';
import HOD from './models/hod.js';
import SIWESCoordinator from './models/siwesCoordinator.js';

const verify = async () => {
    try {
        await sequelize.authenticate();
        console.log(' Connection has been established successfully.');

        console.log('\n Verifying Student Model (underscored: true)...');
        try {
            const student = await Student.findOne({
                attributes: ['id', 'fullName', 'email', 'matricNumber']
            });
            if (student) {
                console.log(' Student fetched successfully:', student.fullName);
            } else {
                console.log(' No students found in database.');
            }
        } catch (err) {
            console.error(' Student fetch failed:', err.message);
            if (err.parent) console.error('   SQL:', err.parent.sql);
        }

        console.log('\n Verifying InstitutionSupervisor Model (Safe selection)...');
        try {
            const supervisor = await InstitutionSupervisor.findOne({
                attributes: ['id', 'fullName', 'email', 'department']
            });
            if (supervisor) {
                console.log(' Supervisor fetched successfully:', supervisor.fullName);
            } else {
                console.log('ℹ No supervisors found in database.');
            }
        } catch (err) {
            console.error(' Supervisor fetch failed:', err.message);
        }

        console.log('\n Verifying HOD Model...');
        try {
            const hod = await HOD.findOne({
                attributes: ['id', 'fullName', 'email', 'department']
            });
            if (hod) {
                console.log(' HOD fetched successfully:', hod.fullName);
            } else {
                console.log(' No HODs found in database.');
            }
        } catch (err) {
            console.error(' HOD fetch failed:', err.message);
        }

        console.log('\n Verifying SIWESCoordinator Model (Table name fix)...');
        try {
            const coordinator = await SIWESCoordinator.findOne({
                attributes: ['id', 'fullName', 'email', 'department']
            });
            if (coordinator) {
                console.log(' Coordinator fetched successfully:', coordinator.fullName);
            } else {
                console.log(' No coordinators found in database.');
            }
        } catch (err) {
            console.error(' Coordinator fetch failed:', err.message);
        }

        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

verify();
