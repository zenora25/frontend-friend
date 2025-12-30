import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SIWESCoordinator = sequelize.define("SIWESCoordinator", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }
});

export default SIWESCoordinator;
