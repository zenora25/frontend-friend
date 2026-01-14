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
    field: 'full_name' // Maps to full_name in database
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
    field: 'matric_number' // Maps to matric_number in database
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      // Hash password before saving
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(value, salt);
      this.setDataValue('password', hash);
    }
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  companyName: {
    type: DataTypes.STRING,
    field: 'company_name' // Maps to company_name in database
  },
  companyAddress: {
    type: DataTypes.TEXT,
    field: 'company_address' // Maps to company_address in database
  },
  assignedSupervisor: {
    type: DataTypes.INTEGER,
    references: {
      model: 'institutionsupervisors',
      key: 'id',
    },
    field: 'assigned_supervisor' // Maps to assigned_supervisor in database
  },
  assignedIndustrySupervisor: {
    type: DataTypes.INTEGER,
    references: {
      model: 'industrysupervisors',
      key: 'id',
    },
    field: 'assigned_industry_supervisor' // Maps to assigned_industry_supervisor in database
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified' // Maps to is_verified in database
  },
  verificationCodeUsed: {
    type: DataTypes.STRING,
    field: 'verification_code_used' // Maps to verification_code_used in database
  },
  phone: {
    type: DataTypes.STRING,
  },
  profileImage: {
    type: DataTypes.TEXT,
    field: 'profile_image' // Maps to profile_image in database
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'ACTIVE',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at' // Maps to created_at in database
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at' // Maps to updated_at in database
  },
}, {
  tableName: 'students',
  timestamps: true,
  // Note: We're not using underscored: true because we're explicitly mapping each field
  // This gives us more control over the mapping
});

// Instance method to compare password
Student.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default Student;