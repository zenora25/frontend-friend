import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Student from "./student.js";
import InstitutionSupervisor from "./institutionSupervisor.js";
import IndustrySupervisor from "./industrySupervisor.js";

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
                model: Student,
                key: "id",
            },
        },
        institutionSupervisorId: {
            type: DataTypes.INTEGER,
            references: {
                model: InstitutionSupervisor,
                key: "id",
            },
        },
        industrySupervisorId: {
            type: DataTypes.INTEGER,
            references: {
                model: IndustrySupervisor,
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

Assignment.belongsTo(Student, { foreignKey: "studentId" });
Assignment.belongsTo(InstitutionSupervisor, { foreignKey: "institutionSupervisorId" });
Assignment.belongsTo(IndustrySupervisor, { foreignKey: "industrySupervisorId" });

export default Assignment;