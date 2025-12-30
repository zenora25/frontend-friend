import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Letter = sequelize.define("Letter", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  fileUrl: { type: DataTypes.STRING, allowNull: false },
  uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default Letter;
