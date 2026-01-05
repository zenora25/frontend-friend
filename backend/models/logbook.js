import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Logbook = sequelize.define(
    "Logbook",
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
        weekNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 52,
            },
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        weekSummary: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("PENDING", "APPROVED", "REVISION"),
            defaultValue: "PENDING",
        },
        supervisorComment: {
            type: DataTypes.TEXT,
        },
    },
    {
        tableName: "logbooks",
        timestamps: true,
    }
);

export default Logbook;