import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Assignment = sequelize.define(
    "Assignment",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "students", // Use string table name
                key: "id",
            },
        },
        institutionSupervisorId: {
            type: DataTypes.INTEGER,
            references: {
                model: "institutionsupervisors", // Use string table name
                key: "id",
            },
        },
        industrySupervisorId: {
            type: DataTypes.INTEGER,
            references: {
                model: "industrysupervisors", // Use string table name
                key: "id",
            },
        },
        assignedBy: {
            type: DataTypes.INTEGER,
            allowNull: false, // HOD or Coordinator ID
        },
    },
    {
        tableName: "assignments",
        timestamps: true,
    }
);

export default Assignment;