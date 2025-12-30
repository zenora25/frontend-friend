import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const VerificationCode = sequelize.define("VerificationCode", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false }, // Student email
  issuedBy: { type: DataTypes.INTEGER, allowNull: false }, // Coordinator ID
  department: { type: DataTypes.STRING, allowNull: false },
  isUsed: { type: DataTypes.BOOLEAN, defaultValue: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default VerificationCode;