import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Letter = sequelize.define("Letter", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  studentId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'student_id'
  },
  type: {
    type: DataTypes.ENUM('ACCEPTANCE', 'COMPLETION', 'APPLICATION'),
    allowNull: false,
    defaultValue: 'ACCEPTANCE'
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_url'
  },
  fileName: {
    type: DataTypes.STRING,
    field: 'file_name'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'UPLOADED'
  },
  uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'letters',
  timestamps: true
});

export default Letter;
