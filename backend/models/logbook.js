// models/logbook.js
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
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "students",
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
      type: DataTypes.ENUM("PENDING", "APPROVED", "REVISION", "DRAFT"),
      defaultValue: "PENDING",
    },
    supervisorComment: {
      type: DataTypes.TEXT,
    },
    // Industry supervisor review fields
    industryStatus: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REVISION", "DRAFT"),
      defaultValue: "PENDING",
    },
    industryComment: {
      type: DataTypes.TEXT,
    },
    industryReviewedAt: {
      type: DataTypes.DATE,
    },
    // Institution supervisor review fields
    institutionStatus: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REVISION", "DRAFT"),
      defaultValue: "PENDING",
    },
    institutionComment: {
      type: DataTypes.TEXT,
    },
    institutionReviewedAt: {
      type: DataTypes.DATE,
    },
    // Image fields
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
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
    challengesFaced: {
      type: DataTypes.TEXT,
    },
    lessonsLearned: {
      type: DataTypes.TEXT,
    },
    skillsAcquired: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "logbooks",
    timestamps: true,
  }
);

// Associations are now defined in db.js

export default Logbook;