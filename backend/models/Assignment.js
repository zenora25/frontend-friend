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
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "students",
                key: "id",
            },
        },
        institutionSupervisorId: {
            type: DataTypes.INTEGER,
            references: {
                model: "institutionsupervisors",
                key: "id",
            },
        },
        industrySupervisorId: {
            type: DataTypes.INTEGER,
            references: {
                model: "industrysupervisors",
                key: "id",
            },
        },
        assignedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "h_o_ds",
                key: "id",
            },
        },
        status: {
            type: DataTypes.ENUM("ACTIVE", "INACTIVE", "COMPLETED"),
            defaultValue: "ACTIVE",
        },
    },
    {
        tableName: "assignments",
        timestamps: true,
    }
);

export default Assignment;