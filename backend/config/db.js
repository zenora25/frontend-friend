import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Use MYSQL_* variables or fall back to DB_* variables
const sequelize = new Sequelize(
    process.env.MYSQL_DB || process.env.DB_NAME || "intern",
    process.env.MYSQL_USER || process.env.DB_USER || "root",
    process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "pass123",
    {
        host: process.env.MYSQL_HOST || process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        dialect: "mysql",
        logging: process.env.NODE_ENV === "development" ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            timestamps: true,
            underscored: true,
        },
    }
);

// Test connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connection established successfully.");
        console.log(`📊 Database: ${process.env.MYSQL_DB || process.env.DB_NAME}`);
        console.log(`👤 User: ${process.env.MYSQL_USER || process.env.DB_USER}`);
        return true;
    } catch (error) {
        console.error("❌ Unable to connect to the database:", error.message);
        console.log("\n🔧 Current configuration:");
        console.log(`Host: ${process.env.MYSQL_HOST || process.env.DB_HOST || "localhost"}`);
        console.log(`Database: ${process.env.MYSQL_DB || process.env.DB_NAME || "intern"}`);
        console.log(`User: ${process.env.MYSQL_USER || process.env.DB_USER || "root"}`);
        console.log(`Password: ${process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD ? "****" : "empty"}`);

        console.log("\n🔧 Troubleshooting steps:");
        console.log("1. Make sure MySQL is running:");
        console.log("   Windows: net start MySQL");
        console.log("   Mac/Linux: sudo service mysql start");
        console.log("2. Check if database exists: CREATE DATABASE intern;");
        console.log("3. Verify credentials by connecting manually:");
        console.log("   mysql -u root -p");
        console.log("   (password: pass123)");
        console.log("4. Create database: CREATE DATABASE intern;");
        process.exit(1);
    }
};

export default sequelize;