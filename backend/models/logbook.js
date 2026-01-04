import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Student from "./student.js";

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
          model: Student,
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
      mondayActivities: {
        type: DataTypes.TEXT,
      },
      tuesdayActivities: {
        type: DataTypes.TEXT,
      },
      wednesdayActivities: {
        type: DataTypes.TEXT,
      },
      thursdayActivities: {
        type: DataTypes.TEXT,
      },
      fridayActivities: {
        type: DataTypes.TEXT,
      },
      weekSummary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      challengesFaced: {
        type: DataTypes.TEXT,
      },
      lessonsLearned: {
        type: DataTypes.TEXT,
      },
      skillsAcquired: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REVISION"),
        defaultValue: "PENDING",
      },
      supervisorComment: {
        type: DataTypes.TEXT,
      },
      industrySupervisorComment: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "logbooks",
      timestamps: true,
    }
);

Logbook.belongsTo(Student, { foreignKey: "studentId" });
Student.hasMany(Logbook, { foreignKey: "studentId" });

export default Logbook;