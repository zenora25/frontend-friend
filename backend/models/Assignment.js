import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Assignment = sequelize.define("Assignment", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false },
    institutionSupervisorId: { type: DataTypes.INTEGER, allowNull: false },
    hodId: { type: DataTypes.INTEGER, allowNull: false },
    assignedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'TERMINATED'),
        defaultValue: 'ACTIVE'
    },
});

export default Assignment;