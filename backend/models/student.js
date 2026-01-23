// models/student.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import bcrypt from 'bcryptjs';

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'full_name'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  matricNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'matric_number'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  companyName: {
    type: DataTypes.STRING,
    field: 'company_name'
  },
  companyAddress: {
    type: DataTypes.TEXT,
    field: 'company_address'
  },
  assignedSupervisor: {
    type: DataTypes.INTEGER,
    field: 'assigned_supervisor',
  },
  assignedIndustrySupervisor: {
    type: DataTypes.INTEGER,
    field: 'assigned_industry_supervisor',
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified'
  },
  verificationCodeUsed: {
    type: DataTypes.STRING,
    field: 'verification_code_used'
  },
  phone: {
    type: DataTypes.STRING,
  },
  profileImage: {
    type: DataTypes.TEXT,
    field: 'profile_image'
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'INACTIVE'),
    defaultValue: 'ACTIVE',
  },
  siwesStartDate: {
    type: DataTypes.DATEONLY,
    field: 'siwes_start_date'
  },
  siwesEndDate: {
    type: DataTypes.DATEONLY,
    field: 'siwes_end_date'
  },
  totalWeeks: {
    type: DataTypes.INTEGER,
    defaultValue: 24,
    field: 'total_weeks'
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login'
  }
}, {
  tableName: 'students',
  timestamps: true, // This enables createdAt and updatedAt
  createdAt: 'created_at', // Map to snake_case column
  updatedAt: 'updated_at', // Map to snake_case column
  underscored: false, // Set to false since we're manually mapping
});

// Instance method to compare password
Student.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default Student;