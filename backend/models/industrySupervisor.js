import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcryptjs";

const IndustrySupervisor = sequelize.define(
    "IndustrySupervisor",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      companyName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "industrysupervisors",
      timestamps: true,
      hooks: {
        beforeCreate: async (supervisor) => {
          if (supervisor.password) {
            const salt = await bcrypt.genSalt(10);
            supervisor.password = await bcrypt.hash(supervisor.password, salt);
          }
        },
        beforeUpdate: async (supervisor) => {
          if (supervisor.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            supervisor.password = await bcrypt.hash(supervisor.password, salt);
          }
        },
      },
    }
);

IndustrySupervisor.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default IndustrySupervisor;