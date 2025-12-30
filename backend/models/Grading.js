import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Grading = sequelize.define("Grading", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false },
    score: { type: DataTypes.DECIMAL(5, 2), allowNull: false }, // 0-100
    remarks: { type: DataTypes.TEXT },
    defenseDate: { type: DataTypes.DATE, allowNull: false },
    assessor: { type: DataTypes.STRING, allowNull: false }, // Coordinator name
    verdict: {
        type: DataTypes.ENUM('PASS', 'FAIL', 'PENDING'),
        defaultValue: 'PENDING'
    },
    submittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default Grading;