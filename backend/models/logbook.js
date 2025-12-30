import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Logbook = sequelize.define("Logbook", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  weekNumber: { type: DataTypes.INTEGER, allowNull: false },
  activityDescription: { type: DataTypes.TEXT, allowNull: false },
  dateSubmitted: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING, defaultValue: "Pending" },
});

export default Logbook;
