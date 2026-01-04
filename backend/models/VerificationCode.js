import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const VerificationCode = sequelize.define(
    "VerificationCode",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      department: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      issuedBy: {
        type: DataTypes.INTEGER,
        allowNull: false, // SIWES Coordinator ID
      },
      isUsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "verification_codes",
      timestamps: true,
    }
);

export default VerificationCode;