import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const VerificationCode = sequelize.define("VerificationCode", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issuedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
});

// Set expiration time (24 hours from creation)
VerificationCode.beforeCreate((code) => {
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);
  code.expiresAt = expires;
});

export default VerificationCode;