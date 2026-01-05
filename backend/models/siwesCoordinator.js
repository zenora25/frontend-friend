import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcryptjs";

const SIWESCoordinator = sequelize.define(
    "SIWESCoordinator",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      department: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    },
    {
      tableName: "siwescoordinators",
      timestamps: true,
      hooks: {
        beforeCreate: async (coordinator) => {
          if (coordinator.password) {
            const salt = await bcrypt.genSalt(10);
            coordinator.password = await bcrypt.hash(coordinator.password, salt);
          }
        },
        beforeUpdate: async (coordinator) => {
          if (coordinator.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            coordinator.password = await bcrypt.hash(coordinator.password, salt);
          }
        },
      },
    }
);

SIWESCoordinator.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default SIWESCoordinator;