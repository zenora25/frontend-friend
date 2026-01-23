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
    field: 'full_name' // Explicit mapping
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
    field: 'matric_number' // Explicit mapping
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
    field: 'company_name' // Explicit mapping
  },
  companyAddress: {
    type: DataTypes.TEXT,
    field: 'company_address' // Explicit mapping
  },
  assignedSupervisor: {
    type: DataTypes.INTEGER,
    field: 'assigned_supervisor', // Explicit mapping
    references: {
      model: 'institutionsupervisors',
      key: 'id',
    },
  },
  assignedIndustrySupervisor: {
    type: DataTypes.INTEGER,
    field: 'assigned_industry_supervisor', // Explicit mapping
    references: {
      model: 'industrysupervisors',
      key: 'id',
    },
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified' // Explicit mapping
  },
  verificationCodeUsed: {
    type: DataTypes.STRING,
    field: 'verification_code_used' // Explicit mapping
  },
  phone: {
    type: DataTypes.STRING,
  },
  profileImage: {
    type: DataTypes.TEXT,
    field: 'profile_image' // Explicit mapping
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
    field: 'siwes_start_date' // Explicit mapping
  },
  siwesEndDate: {
    type: DataTypes.DATEONLY,
    field: 'siwes_end_date' // Explicit mapping
  },
  totalWeeks: {
    type: DataTypes.INTEGER,
    defaultValue: 24,
    field: 'total_weeks' // Explicit mapping
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login' // Explicit mapping
  }
}, {
  tableName: 'students',
  timestamps: true,
  createdAt: 'created_at', // Explicit mapping for timestamps
  updatedAt: 'updated_at', // Explicit mapping for timestamps
  underscored: true,
  hooks: {
    beforeCreate: async (student) => {
      if (student.password) {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(student.password, salt);
      }
      
      // Temporarily disable email validation to test
      // Remove or comment out the custom validator
      console.log(`Creating student with email: ${student.email}`);
    },
    beforeUpdate: async (student) => {
      if (student.password && student.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(student.password, salt);
      }
    }
  }
});

// Instance method to compare password
Student.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default Student;