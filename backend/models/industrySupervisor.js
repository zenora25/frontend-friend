import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcryptjs";

const IndustrySupervisor = sequelize.define(
    "IndustrySupervisor",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fullName: {
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
        companyName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(20),
        },
        profileImage: {
            type: DataTypes.STRING,
        },
        companyAddress: {
            type: DataTypes.TEXT,
        },
        position: {
            type: DataTypes.STRING(100),
        },
        department: {
            type: DataTypes.STRING(100),
        },
        lastLogin: {
            type: DataTypes.DATE,
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