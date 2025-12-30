import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST || "localhost",
    dialect: "mysql",
    logging: false, // optional: hides SQL query logs
  }
);

export const connectMYSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log(" MYSQL Connected Successfully");
  } catch (err) {
    console.error("MYSQL Connection Error:", err.message);
  }
};

export default sequelize;
