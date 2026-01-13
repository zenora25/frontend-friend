import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DB || 'intern',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || 'pass123',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.MYSQL_PORT || 3306,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const connectMYSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected Successfully');
    return true;
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error.message);
    return false;
  }
};

export default sequelize;