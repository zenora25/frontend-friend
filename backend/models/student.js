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
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      isBazeEmail(value) {
        if (!value.toLowerCase().endsWith('@bazeuniversity.edu.ng')) {
          throw new Error('Only @bazeuniversity.edu.ng email addresses are allowed');
        }
      }
    },
  },
  matricNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
  },
  companyAddress: {
    type: DataTypes.TEXT,
  },
  assignedSupervisor: {
    type: DataTypes.INTEGER,
    references: {
      model: 'institutionsupervisors',
      key: 'id',
    },
  },
  assignedIndustrySupervisor: {
    type: DataTypes.INTEGER,
    references: {
      model: 'industrysupervisors',
      key: 'id',
    },
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verificationCodeUsed: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  profileImage: {
    type: DataTypes.TEXT,
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
  },
  siwesEndDate: {
    type: DataTypes.DATEONLY,
  },
  totalWeeks: {
    type: DataTypes.INTEGER,
    defaultValue: 24,
  },
  lastLogin: {
    type: DataTypes.DATE,
  }
}, {
  tableName: 'students',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (student) => {
      if (student.password && student.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(student.password, salt);
      }
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

// Remove the old associate method and let db.js handle it
// Associations are now defined in db.js

export default Student;