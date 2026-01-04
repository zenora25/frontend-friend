import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Student from "./student.js";

const Defense = sequelize.define(
    "Defense",
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
                model: Student,
                key: "id",
            },
        },
        defenseDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        defenseTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        venue: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        duration: {
            type: DataTypes.STRING(20),
            defaultValue: "30 minutes",
        },
        panelMembers: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        status: {
            type: DataTypes.ENUM("SCHEDULED", "COMPLETED", "CANCELLED", "PENDING"),
            defaultValue: "PENDING",
        },
        score: {
            type: DataTypes.FLOAT,
            validate: {
                min: 0,
                max: 100,
            },
        },
        remarks: {
            type: DataTypes.TEXT,
        },
        verdict: {
            type: DataTypes.ENUM("PASS", "FAIL", "PENDING"),
            defaultValue: "PENDING",
        },
        scheduledBy: {
            type: DataTypes.INTEGER,
            allowNull: false, // Coordinator ID
        },
    },
    {
        tableName: "defenses",
        timestamps: true,
    }
);

Defense.belongsTo(Student, { foreignKey: "studentId" });
Student.hasOne(Defense, { foreignKey: "studentId" });

export default Defense;