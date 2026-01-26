import sequelize from '../config/db.js';
import Student from './student.js';
import InstitutionSupervisor from './institutionSupervisor.js';
import IndustrySupervisor from './industrySupervisor.js';
import HOD from './hod.js';
import SIWESCoordinator from './siwesCoordinator.js';
import VerificationCode from './VerificationCode.js';
import Logbook from './logbook.js';
import Assignment from './Assignment.js';
import Defense from './Defense.js';

// Define associations
const defineAssociations = () => {
  // Student associations
  Student.belongsTo(InstitutionSupervisor, {
    foreignKey: 'assignedSupervisor',
    as: 'Supervisor'
  });

  Student.belongsTo(IndustrySupervisor, {
    foreignKey: 'assignedIndustrySupervisor',
    as: 'IndustrySupervisor'
  });

  Student.hasMany(Logbook, {
    foreignKey: 'studentId',
    as: 'Logbooks'
  });

  // Changed from hasMany to hasOne for Assignment
  Student.hasOne(Assignment, {
    foreignKey: 'studentId',
    as: 'assignment'
  });

  Student.hasOne(Defense, {
    foreignKey: 'studentId',
    as: 'defense'
  });

  // Institution Supervisor associations
  InstitutionSupervisor.hasMany(Student, {
    foreignKey: 'assignedSupervisor',
    as: 'AssignedStudents'
  });

  InstitutionSupervisor.hasMany(Assignment, {
    foreignKey: 'institutionSupervisorId',
    as: 'assignments'
  });

  // Industry Supervisor associations
  IndustrySupervisor.hasMany(Student, {
    foreignKey: 'assignedIndustrySupervisor',
    as: 'AssignedInterns'
  });

  // Added 'as' alias for consistency
  IndustrySupervisor.hasMany(Assignment, {
    foreignKey: 'industrySupervisorId',
    as: 'assignments'
  });

  // SIWES Coordinator associations
  SIWESCoordinator.hasMany(VerificationCode, {
    foreignKey: 'issuedBy',
    as: 'issuedVerificationCodes'
  });

  SIWESCoordinator.hasMany(Defense, {
    foreignKey: 'scheduledBy',
    as: 'scheduledDefenses'
  });

  // Logbook associations
  // Added 'as' alias
  Logbook.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student'
  });

  // Assignment associations
  // Added 'as' alias
  Assignment.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student'
  });

  Assignment.belongsTo(InstitutionSupervisor, {
    foreignKey: 'institutionSupervisorId',
    as: 'institutionSupervisor'
  });

  // This association was already present, keeping it
  Assignment.belongsTo(IndustrySupervisor, {
    foreignKey: 'industrySupervisorId',
    as: 'industrySupervisor'
  });

  Assignment.belongsTo(HOD, {
    foreignKey: 'assignedBy',
    as: 'assignedByHOD'
  });

  // Defense associations
  // Changed alias to 'student' (lowercase) for consistency
  Defense.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student'
  });

  Defense.belongsTo(SIWESCoordinator, {
    foreignKey: 'scheduledBy',
    as: 'scheduledByCoordinator'
  });

  // Verification Code associations
  VerificationCode.belongsTo(SIWESCoordinator, {
    foreignKey: 'issuedBy',
    as: 'issuedByCoordinator'
  });

  // HOD associations
  HOD.hasMany(Assignment, {
    foreignKey: 'assignedBy',
    as: 'AssignmentsMade'
  });
};

// Safe model synchronization (no alter to avoid datetime issues)
export const syncModels = async () => {
  try {
    console.log(' Defining model associations...');
    defineAssociations();

    console.log(' Synchronizing models (safe mode)...');
    // Use alter: false to avoid datetime and constraint issues
    await sequelize.sync({ alter: false });

    console.log(' All models synchronized successfully');
    return true;
  } catch (error) {
    console.error(' Model synchronization failed:', error.message);

    // Provide helpful debugging information
    if (error.original && error.original.sqlMessage) {
      console.error(' SQL Error:', error.original.sqlMessage);
      console.error(' SQL Query:', error.sql);

      if (error.original.sqlMessage.includes('datetime')) {
        console.log('\n Solution for datetime error:');
        console.log('1. Run this SQL command in your MySQL database:');
        console.log('   SET GLOBAL sql_mode = "NO_ENGINE_SUBSTITUTION";');
        console.log('\n2. Or add this to your my.cnf/my.ini file:');
        console.log('   [mysqld]');
        console.log('   sql_mode = "NO_ENGINE_SUBSTITUTION"');
      }
    }

    return false;
  }
};

// Alternative safe sync with manual table creation
export const safeSyncModels = async () => {
  try {
    console.log(' Starting safe model synchronization...');
    defineAssociations();

    // First, sync without altering existing tables
    await sequelize.sync({ alter: false });

    console.log(' Models synchronized (safe mode)');
    return true;
  } catch (error) {
    console.error(' Safe sync failed:', error.message);

    // Try even safer approach - sync individual models
    try {
      console.log(' Attempting individual model sync...');

      // Sync each model separately
      const models = [
        Student,
        InstitutionSupervisor,
        IndustrySupervisor,
        HOD,
        SIWESCoordinator,
        VerificationCode,
        Logbook,
        Assignment,
        Defense
      ];

      for (const model of models) {
        try {
          await model.sync({ alter: false });
          console.log(` ${model.name} synced`);
        } catch (modelError) {
          console.warn(`  Failed to sync ${model.name}:`, modelError.message);
        }
      }

      console.log(' Individual model sync completed');
      return true;
    } catch (individualError) {
      console.error(' Individual model sync also failed:', individualError.message);
      return false;
    }
  }
};

// Force sync (DANGEROUS - drops all tables and recreates them)
export const forceSyncModels = async () => {
  try {
    console.log('  WARNING: Force syncing models (will drop all tables!)');
    console.log('  This will delete all data in the database!');

    defineAssociations();

    // Add a safety delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log(' Force syncing models...');
    await sequelize.sync({ force: true });

    console.log(' All models force-synced successfully (all data lost)');
    return true;
  } catch (error) {
    console.error(' Force sync failed:', error);
    return false;
  }
};

// Sync with alter (can cause datetime issues)
export const alterSyncModels = async () => {
  try {
    console.log(' Syncing models with alter...');
    defineAssociations();

    await sequelize.sync({ alter: true });

    console.log(' Models synchronized with alter');
    return true;
  } catch (error) {
    console.error(' Alter sync failed:', error);

    if (error.original && error.original.sqlMessage) {
      console.error(' SQL Error:', error.original.sqlMessage);

      if (error.original.sqlMessage.includes('Incorrect datetime value')) {
        console.log('\n Fix for datetime error:');
        console.log('Run these SQL commands in your database:');
        console.log(`
          -- Fix existing tables
          ALTER TABLE institutionsupervisors 
          MODIFY COLUMN createdAt DATETIME NULL,
          MODIFY COLUMN updatedAt DATETIME NULL;
          
          -- Update NULL values
          UPDATE institutionsupervisors 
          SET createdAt = NOW() WHERE createdAt IS NULL;
          UPDATE institutionsupervisors 
          SET updatedAt = NOW() WHERE updatedAt IS NULL;
          
          -- Make columns NOT NULL
          ALTER TABLE institutionsupervisors 
          MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          MODIFY COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
        `);
      }
    }

    return false;
  }
};

// Check if tables exist
export const checkTables = async () => {
  try {
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${sequelize.config.database}'
    `);

    const tableNames = results.map(row => row.TABLE_NAME);
    console.log(' Existing tables:', tableNames);

    return tableNames;
  } catch (error) {
    console.error(' Error checking tables:', error.message);
    return [];
  }
};

// Check if specific table exists
export const tableExists = async (tableName) => {
  try {
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${sequelize.config.database}'
      AND TABLE_NAME = '${tableName.toLowerCase()}'
    `);

    return results.length > 0;
  } catch (error) {
    console.error(' Error checking table existence:', error.message);
    return false;
  }
};

// Get database information
export const getDatabaseInfo = async () => {
  try {
    const [tables] = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        TABLE_ROWS,
        CREATE_TIME,
        UPDATE_TIME
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${sequelize.config.database}'
      ORDER BY TABLE_NAME
    `);

    return {
      database: sequelize.config.database,
      host: sequelize.config.host,
      dialect: sequelize.options.dialect,
      tableCount: tables.length,
      tables: tables
    };
  } catch (error) {
    console.error(' Error getting database info:', error.message);
    return null;
  }
};

// Export models and sequelize instance
export {
  Student,
  InstitutionSupervisor,
  IndustrySupervisor,
  HOD,
  SIWESCoordinator,
  VerificationCode,
  Logbook,
  Assignment,
  Defense,
  sequelize
};

// Export association function for external use
export { defineAssociations };

// Default export
export default {
  sequelize,
  Student,
  InstitutionSupervisor,
  IndustrySupervisor,
  HOD,
  SIWESCoordinator,
  VerificationCode,
  Logbook,
  Assignment,
  Defense,
  syncModels,
  safeSyncModels,
  forceSyncModels,
  alterSyncModels,
  checkTables,
  tableExists,
  getDatabaseInfo,
  defineAssociations
};