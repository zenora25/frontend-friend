import bcrypt from "bcryptjs";
import sequelize from "../config/db.js";

// Import models
import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import IndustrySupervisor from "../models/industrySupervisor.js";
import HOD from "../models/hod.js";
import SIWESCoordinator from "../models/siwesCoordinator.js";
import VerificationCode from "../models/VerificationCode.js";
import Logbook from "../models/logbook.js";
import Assignment from "../models/Assignment.js";
import Defense from "../models/Defense.js";

const seedDatabase = async () => {
    console.log("🚀 Starting database seeding...");

    try {
        // Test connection
        await sequelize.authenticate();
        console.log("✅ Database connection established successfully.");

        // Disable foreign key checks
        console.log("🔧 Disabling foreign key checks...");
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // Drop all tables
        console.log("🧹 Dropping all tables...");
        await sequelize.drop();
        console.log("✅ All tables dropped");

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        // Sync all tables - now they will all use consistent table names
        console.log("🔄 Syncing all tables...");
        await sequelize.sync({ force: true });
        console.log("✅ All database tables created successfully");

        // Create SIWES Coordinator
        console.log("👑 Creating SIWES Coordinator...");
        const coordinator = await SIWESCoordinator.create({
            fullName: "Dr. Admin Coordinator",
            email: "coordinator@bazeuniversity.edu.ng",
            password: "password123", // Will be hashed by hook
            department: "Faculty of Computing",
        });
        console.log(`✅ SIWES Coordinator created: ${coordinator.email}`);

        // Create HODs
        console.log("👨‍🏫 Creating HODs...");
        const hodCS = await HOD.create({
            fullName: "Dr. Computer Science HOD",
            email: "hod.cs@bazeuniversity.edu.ng",
            password: "password123",
            department: "Computer Science",
        });

        const hodSE = await HOD.create({
            fullName: "Dr. Software Engineering HOD",
            email: "hod.se@bazeuniversity.edu.ng",
            password: "password123",
            department: "Software Engineering",
        });
        console.log(`✅ HODs created: ${hodCS.email}, ${hodSE.email}`);

        // Create Institution Supervisors
        console.log("👨‍🏫 Creating Institution Supervisors...");
        const supervisor1 = await InstitutionSupervisor.create({
            fullName: "Dr. Sarah Johnson",
            email: "sarah.johnson@bazeuniversity.edu.ng",
            password: "password123",
            department: "Computer Science",
        });

        const supervisor2 = await InstitutionSupervisor.create({
            fullName: "Prof. Michael Adeyemi",
            email: "michael.adeyemi@bazeuniversity.edu.ng",
            password: "password123",
            department: "Software Engineering",
        });
        console.log(`✅ Institution Supervisors created: ${supervisor1.email}, ${supervisor2.email}`);

        // Create Industry Supervisors
        console.log("👨‍💼 Creating Industry Supervisors...");
        const industrySupervisor1 = await IndustrySupervisor.create({
            fullName: "Mr. James Obi",
            email: "james.obi@techsolutions.com",
            password: "password123",
            companyName: "Tech Solutions Ltd",
            phone: "+2348012345678",
        });

        const industrySupervisor2 = await IndustrySupervisor.create({
            fullName: "Mrs. Grace Okonkwo",
            email: "grace.okonkwo@digitalinnovations.com",
            password: "password123",
            companyName: "Digital Innovations",
            phone: "+2348098765432",
        });
        console.log(`✅ Industry Supervisors created: ${industrySupervisor1.email}, ${industrySupervisor2.email}`);

        // Create Students
        console.log("🎓 Creating Students...");
        const student1 = await Student.create({
            fullName: "John Doe",
            email: "john.doe@bazeuniversity.edu.ng",
            password: "password123",
            matricNumber: "BU/23A/CS/8001",
            department: "Computer Science",
            companyName: "Tech Solutions Ltd",
            companyAddress: "123 Tech Street, Abuja",
            assignedSupervisor: supervisor1.id,
            assignedIndustrySupervisor: industrySupervisor1.id,
            isVerified: true,
            verificationCodeUsed: true,
            progress: 75,
            status: "ACTIVE",
        });

        const student2 = await Student.create({
            fullName: "Jane Smith",
            email: "jane.smith@bazeuniversity.edu.ng",
            password: "password123",
            matricNumber: "BU/23A/SE/8002",
            department: "Software Engineering",
            companyName: "Digital Innovations",
            companyAddress: "456 Digital Avenue, Lagos",
            assignedSupervisor: supervisor2.id,
            assignedIndustrySupervisor: industrySupervisor2.id,
            isVerified: true,
            verificationCodeUsed: true,
            progress: 68,
            status: "ACTIVE",
        });
        console.log(`✅ Students created: ${student1.email}, ${student2.email}`);

        // Create verification codes - FIXED: DEF456 should be unused
        console.log("🔐 Creating Verification Codes...");
        const verificationCode1 = await VerificationCode.create({
            code: "ABC123",
            email: "newstudent1@bazeuniversity.edu.ng",
            department: "Computer Science",
            issuedBy: coordinator.id,
            isUsed: false,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        const verificationCode2 = await VerificationCode.create({
            code: "DEF456",
            email: "newstudent2@bazeuniversity.edu.ng",
            department: "Software Engineering",
            issuedBy: coordinator.id,
            isUsed: false, // CHANGED FROM true TO false
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        console.log(`✅ Verification codes created`);

        // Create logbook entries
        console.log("📔 Creating Logbook Entries...");
        const logbook1 = await Logbook.create({
            studentId: student1.id,
            weekNumber: 8,
            startDate: "2024-03-11",
            endDate: "2024-03-17",
            title: "API Development & Testing",
            weekSummary: "Worked on implementing REST API endpoints for user management module.",
            status: "APPROVED",
            supervisorComment: "Excellent work! Well documented.",
        });

        const logbook2 = await Logbook.create({
            studentId: student2.id,
            weekNumber: 7,
            startDate: "2024-03-04",
            endDate: "2024-03-10",
            title: "Database Design",
            weekSummary: "Designed and implemented database schema.",
            status: "PENDING",
        });
        console.log(`✅ Logbook entries created`);

        // Create assignments
        console.log("🤝 Creating Assignments...");
        const assignment1 = await Assignment.create({
            studentId: student1.id,
            institutionSupervisorId: supervisor1.id,
            industrySupervisorId: industrySupervisor1.id,
            assignedBy: hodCS.id,
        });

        const assignment2 = await Assignment.create({
            studentId: student2.id,
            institutionSupervisorId: supervisor2.id,
            industrySupervisorId: industrySupervisor2.id,
            assignedBy: hodSE.id,
        });
        console.log(`✅ Assignments created`);

        // Create a defense record
        console.log("🎤 Creating Defense record...");
        const defense = await Defense.create({
            studentId: student1.id,
            defenseDate: "2024-06-15",
            defenseTime: "10:00:00",
            venue: "Room 101, Computing Building",
            duration: "45 minutes",
            panelMembers: ["Dr. Sarah Johnson", "Mr. James Obi", "Dr. Computer Science HOD"],
            status: "SCHEDULED",
            scheduledBy: coordinator.id,
        });
        console.log(`✅ Defense created for ${student1.fullName}`);

        console.log("\n🎉 Seed data created successfully!");
        console.log("\n📋 =============================");
        console.log("   TEST ACCOUNTS");
        console.log("   =============================");
        console.log("\n👑 SIWES Coordinator:");
        console.log("   Email: coordinator@bazeuniversity.edu.ng");
        console.log("   Password: password123");

        console.log("\n👨‍🏫 HOD (Computer Science):");
        console.log("   Email: hod.cs@bazeuniversity.edu.ng");
        console.log("   Password: password123");

        console.log("\n👨‍🏫 Institution Supervisor:");
        console.log("   Email: sarah.johnson@bazeuniversity.edu.ng");
        console.log("   Password: password123");

        console.log("\n👨‍💼 Industry Supervisor:");
        console.log("   Email: james.obi@techsolutions.com");
        console.log("   Password: password123");

        console.log("\n🎓 Student:");
        console.log("   Email: john.doe@bazeuniversity.edu.ng");
        console.log("   Password: password123");
        console.log("   Matric: BU/23A/CS/8001");

        console.log("\n🔐 Verification Code (unused):");
        console.log("   Code: ABC123");
        console.log("   Email: newstudent1@bazeuniversity.edu.ng");
        console.log("   Department: Computer Science");

        console.log("\n🔐 Verification Code (unused - FIXED):");
        console.log("   Code: DEF456");
        console.log("   Email: newstudent2@bazeuniversity.edu.ng");
        console.log("   Department: Software Engineering");

        console.log("\n📊 Summary:");
        console.log(`   Total Users: ${await Student.count() + await InstitutionSupervisor.count() + await IndustrySupervisor.count() + await HOD.count() + await SIWESCoordinator.count()}`);
        console.log(`   Students: ${await Student.count()}`);
        console.log(`   Institution Supervisors: ${await InstitutionSupervisor.count()}`);
        console.log(`   Industry Supervisors: ${await IndustrySupervisor.count()}`);
        console.log(`   HODs: ${await HOD.count()}`);
        console.log(`   Coordinators: ${await SIWESCoordinator.count()}`);
        console.log(`   Logbook Entries: ${await Logbook.count()}`);
        console.log(`   Assignments: ${await Assignment.count()}`);
        console.log(`   Verification Codes: ${await VerificationCode.count()}`);
        console.log(`   Defense Records: ${await Defense.count()}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error.message);
        console.error("Full error:", error);
        process.exit(1);
    }
};

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Promise Rejection:', error.message);
    process.exit(1);
});

seedDatabase();