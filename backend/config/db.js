// config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DB || 'intern',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || 'pass123',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.MYSQL_PORT || 3306,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// Test connection
export const connectMYSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected Successfully');

    // Import models AFTER connection is established
    const models = await Promise.all([
      import('../models/student.js').then(m => m.default),
      import('../models/institutionSupervisor.js').then(m => m.default),
      import('../models/logbook.js').then(m => m.default),
      import('../models/Assignment.js').then(m => m.default),
      import('../models/industrySupervisor.js').then(m => m.default),
      import('../models/hod.js').then(m => m.default),
      import('../models/siwesCoordinator.js').then(m => m.default)
    ]);

    const [Student, InstitutionSupervisor, Logbook, Assignment, IndustrySupervisor, HOD, Coordinator] = models;

    // Define associations
    defineAssociations({
      Student,
      InstitutionSupervisor,
      Logbook,
      Assignment,
      IndustrySupervisor,
      HOD,
      Coordinator
    });

    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database tables synced');
    }

    return true;
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error.message);
    return false;
  }
};

// Define associations function
function defineAssociations(models) {
  const {
    Student,
    InstitutionSupervisor,
    Logbook,
    Assignment,
    IndustrySupervisor,
    HOD,
    Coordinator
  } = models;

  // ============================================
  // STUDENT ASSOCIATIONS
  // ============================================
  Student.belongsTo(InstitutionSupervisor, {
    foreignKey: 'assignedSupervisor',
    as: 'Supervisor',
    constraints: false
  });

  Student.belongsTo(IndustrySupervisor, {
    foreignKey: 'assignedIndustrySupervisor',
    as: 'IndustrySupervisor',
    constraints: false
  });

  Student.hasMany(Logbook, {
    foreignKey: 'studentId',
    as: 'Logbooks',
    constraints: false
  });

  Student.hasOne(Assignment, {
    foreignKey: 'studentId',
    as: 'Assignment',
    constraints: false
  });

  // ============================================
  // INSTITUTION SUPERVISOR ASSOCIATIONS
  // ============================================
  InstitutionSupervisor.hasMany(Student, {
    foreignKey: 'assignedSupervisor',
    as: 'assignedStudents',
    constraints: false
  });

  InstitutionSupervisor.hasMany(Assignment, {
    foreignKey: 'institutionSupervisorId',
    as: 'Assignments',
    constraints: false
  });

  // ============================================
  // LOGBOOK ASSOCIATIONS
  // ============================================
  Logbook.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student',
    constraints: false
  });

  // ============================================
  // ASSIGNMENT ASSOCIATIONS
  // ============================================
  Assignment.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student',
    constraints: false
  });

  Assignment.belongsTo(InstitutionSupervisor, {
    foreignKey: 'institutionSupervisorId',
    as: 'institutionSupervisor',
    constraints: false
  });

  Assignment.belongsTo(IndustrySupervisor, {
    foreignKey: 'industrySupervisorId',
    as: 'industrySupervisor',
    constraints: false
  });

  // ============================================
  // INDUSTRY SUPERVISOR ASSOCIATIONS
  // ============================================
  IndustrySupervisor.hasMany(Student, {
    foreignKey: 'assignedIndustrySupervisor',
    as: 'assignedStudents',
    constraints: false
  });

  IndustrySupervisor.hasMany(Assignment, {
    foreignKey: 'industrySupervisorId',
    as: 'Assignments',
    constraints: false
  });

  console.log('✅ All model associations defined');
}

export default sequelize;